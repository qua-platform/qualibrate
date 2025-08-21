import React, { useState, useCallback } from "react";
// eslint-disable-next-line css-modules/no-unused-class
import styles from "./CreateNewProjectForm.module.scss";
import ProjectFormField from "../../../common/ui-components/common/Input/ProjectFormField";
import { useProjectFormValidation } from "../../../ui-lib/hooks/useProjectFormValidation";
import { useProjectContext } from "../context/ProjectContext";
import { ProjectViewApi } from "../api/ProjectViewAPI";

interface Props {
  closeNewProjectForm: () => void;
}

interface FormErrors {
  projectPath?: string;
  dataPath?: string;
  quamPath?: string;
  calibrationPath?: string;
}

const CreateNewProjectForm: React.FC<Props> = ({ closeNewProjectForm }) => {
  const [formData, setFormData] = useState({
    dataPath: "",
    quamPath: "",
    calibrationPath: "",
    projectPath: ""
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { validatePath, validateProjectName } = useProjectFormValidation();
  const { allProjects } = useProjectContext();

  const validateField = useCallback((field: keyof FormErrors, value: string) => {
    let error: string | undefined;
    
    switch (field) {
      case "projectPath":
        error = validateProjectName(value);
        break;
      case "dataPath":
        error = validatePath(value, "Data path");
        break;
      case "quamPath":
        error = validatePath(value, "QUAM path");
        break;
      case "calibrationPath":
        error = validatePath(value, "Calibration path");
        break;
    }
    
    setErrors(prev => ({
      ...prev,
      [field]: error
    }));
    
    return !error;
  }, [validatePath, validateProjectName]);

  const isFormValid = useCallback(() => {
    return !validateProjectName(formData.projectPath);
  }, [formData, validateProjectName]);

  const handleCloseNewProjectForm = useCallback(() => {
    setFormData({
      dataPath: "",
      quamPath: "",
      calibrationPath: "",
      projectPath: ""
    });
    setErrors({});
    closeNewProjectForm();
  }, [closeNewProjectForm]);
  
  const checkProjectNameExists = useCallback((projectName: string): boolean => {
    return allProjects.some(project => project.name === projectName);
  }, [allProjects]);

  const handleSubmit = useCallback(async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!isFormValid()) {
      return;
    }

    setIsSubmitting(true);

    try {
      if (checkProjectNameExists(formData.projectPath)) {
        setErrors(prev => ({
          ...prev,
          projectPath: "A project with this name already exists"
        }));
        return;
      }

      const { isOk, error, result } = await ProjectViewApi.createProject(formData);

      if (isOk) {
        console.log("Project created successfully:", result);
        handleCloseNewProjectForm();
      } else {
        console.error("Failed to create project:", error);
      }
    } catch (err) {
      console.error("Error creating project:", err);
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, isFormValid, checkProjectNameExists, handleCloseNewProjectForm]);

  const handleProjectPathChange = useCallback((val: string) => {
    setFormData({ ...formData, projectPath: val });
    setTimeout(() => validateField("projectPath", val), 300);
  }, [formData, validateField]);

  const handleDataPathChange = useCallback((val: string) => {
    setFormData({ ...formData, dataPath: val });
    if (val.trim()) {
      setTimeout(() => validateField("dataPath", val), 300);
    } else {
      setErrors(prev => ({ ...prev, dataPath: undefined }));
    }
  }, [formData, validateField]);

  const handleQuamPathChange = useCallback((val: string) => {
    setFormData({ ...formData, quamPath: val });
    if (val.trim()) {
      setTimeout(() => validateField("quamPath", val), 300);
    } else {
      setErrors(prev => ({ ...prev, quamPath: undefined }));
    }
  }, [formData, validateField]);

  const handleCalibrationPathChange = useCallback((val: string) => {
    setFormData({ ...formData, calibrationPath: val });
    if (val.trim()) {
      setTimeout(() => validateField("calibrationPath", val), 300);
    } else {
      setErrors(prev => ({ ...prev, calibrationPath: undefined }));
    }
  }, [formData, validateField]);

  return (
    <div className={styles.createProjectPanel}>
      <h3 className={styles.header}>Create New Project</h3>

      <form onSubmit={handleSubmit}>
        <ProjectFormField 
          label="Project name" 
          placeholder="Enter project name" 
          value={formData.projectPath} 
          onChange={handleProjectPathChange}
          error={errors.projectPath}
        />

        <ProjectFormField 
          label="Data path" 
          placeholder="Enter data path" 
          value={formData.dataPath} 
          onChange={handleDataPathChange}
          error={errors.dataPath}
        />

        <ProjectFormField 
          label="QUAM state path" 
          placeholder="Enter QUAM path" 
          value={formData.quamPath} 
          onChange={handleQuamPathChange}
          error={errors.quamPath}
        />

        <ProjectFormField 
          label="Calibration library path" 
          placeholder="Enter calibration path" 
          value={formData.calibrationPath} 
          onChange={handleCalibrationPathChange}
          error={errors.calibrationPath}
        />

        <div className={styles.actions}>
          <button type="button" onClick={handleCloseNewProjectForm} className={styles.cancel} disabled={isSubmitting}>
            Cancel
          </button>
          <button type="submit" className={styles.create} disabled={!isFormValid() || isSubmitting}>
            {isSubmitting ? "Creating..." : "Create"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateNewProjectForm;