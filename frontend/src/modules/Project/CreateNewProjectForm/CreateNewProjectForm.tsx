import React, { useState, useCallback } from "react";
// eslint-disable-next-line css-modules/no-unused-class
import styles from "./CreateNewProjectForm.module.scss";
import ProjectFormField from "../../../common/ui-components/common/Input/ProjectFormField";
import { useProjectFormValidation } from "../../../ui-lib/hooks/useProjectFormValidation";
import { useProjectContext } from "../context/ProjectContext";
import { ProjectViewApi } from "../api/ProjectViewAPI";

interface Props {
  onCancel: () => void;
}

interface FormErrors {
  projectPath?: string;
  dataPath?: string;
  quamPath?: string;
  calibrationPath?: string;
}

const CreateNewProjectForm: React.FC<Props> = ({ onCancel }) => {
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
    return !validateProjectName(formData.projectPath) &&
           !validatePath(formData.dataPath, "Data path") &&
           !validatePath(formData.quamPath, "QUAM path") &&
           !validatePath(formData.calibrationPath, "Calibration path");
  }, [formData, validateProjectName, validatePath]);

  const handleCancel = useCallback(() => {
    setFormData({
      dataPath: "",
      quamPath: "",
      calibrationPath: "",
      projectPath: ""
    });
    setErrors({});
    onCancel();
  }, [onCancel]);
  
  const handleSubmit = useCallback(async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!isFormValid()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Check if project name already exists
      const projectExists = allProjects.some(project => project.name === formData.projectPath);
      if (projectExists) {
        setErrors(prev => ({
          ...prev,
          projectPath: "A project with this name already exists"
        }));
        return;
      }

      const { isOk, error, result } = await ProjectViewApi.createProject(
        formData.projectPath,
        formData.dataPath,
        formData.calibrationPath,
        formData.quamPath
      );

      if (isOk) {
        console.log("Project created successfully:", result);
        handleCancel();
      } else {
        console.error("Failed to create project:", error);
      }
    } catch (err) {
      console.error("Error creating project:", err);
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, isFormValid, allProjects, handleCancel]);

  const handleProjectPathChange = useCallback((val: string) => {
    setFormData({ ...formData, projectPath: val });
    setTimeout(() => validateField("projectPath", val), 300);
  }, [formData, validateField]);

  const handleDataPathChange = useCallback((val: string) => {
    setFormData({ ...formData, dataPath: val });
    setTimeout(() => validateField("dataPath", val), 300);
  }, [formData, validateField]);

  const handleQuamPathChange = useCallback((val: string) => {
    setFormData({ ...formData, quamPath: val });
    setTimeout(() => validateField("quamPath", val), 300);
  }, [formData, validateField]);

  const handleCalibrationPathChange = useCallback((val: string) => {
    setFormData({ ...formData, calibrationPath: val });
    setTimeout(() => validateField("calibrationPath", val), 300);
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
          <button type="button" onClick={handleCancel} className={styles.cancel} disabled={isSubmitting}>
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