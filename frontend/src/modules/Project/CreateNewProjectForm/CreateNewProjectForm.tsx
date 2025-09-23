import React, { useCallback, useState } from "react";
// eslint-disable-next-line css-modules/no-unused-class
import styles from "./CreateNewProjectForm.module.scss";
import ProjectFormField from "../../../common/ui-components/common/Input/ProjectFormField";
import { useProjectFormValidation } from "../../../ui-lib/hooks/useProjectFormValidation";
import { useProjectContext } from "../context/ProjectContext";
import { ProjectViewApi } from "../api/ProjectViewAPI";

interface Props {
  closeNewProjectForm: () => void;
}

export interface NewProjectFormData {
  projectName: string;
  dataPath?: string;
  quamPath?: string;
  calibrationPath?: string;
}

interface FormErrors {
  projectName?: string;
  dataPath?: string;
  quamPath?: string;
  calibrationPath?: string;
}

const initialFormData: NewProjectFormData = {
  projectName: "",
};

const CreateNewProjectForm: React.FC<Props> = ({ closeNewProjectForm }) => {
  const [formData, setFormData] = useState<NewProjectFormData>(initialFormData);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { validatePath, validateProjectName } = useProjectFormValidation();
  const { allProjects, setAllProjects } = useProjectContext();

  const validateField = useCallback(
    (field: keyof NewProjectFormData, value: string) => {
      let error: string | undefined;

      if (field === "projectName") {
        error = validateProjectName(value);
      } else if (value.trim()) {
        const labelMap: Record<keyof NewProjectFormData, string> = {
          projectName: "Project name",
          dataPath: "Data path",
          quamPath: "QUAM path",
          calibrationPath: "Calibration path",
        };
        error = validatePath(value, labelMap[field]);
      } else {
        error = undefined;
      }

      setErrors((prev) => ({ ...prev, [field]: error }));
      return !error;
    },
    [validatePath, validateProjectName]
  );

  const isFormValid = useCallback(() => {
    return !validateProjectName(formData.projectName);
  }, [formData.projectName, validateProjectName]);

  const handleCloseNewProjectForm = useCallback(() => {
    setFormData(initialFormData);
    setErrors({});
    closeNewProjectForm();
  }, [closeNewProjectForm]);

  const checkProjectNameExists = useCallback(
    (projectName: string) => allProjects.some((project) => project.name === projectName),
    [allProjects]
  );

  const handleSubmit = useCallback(
    async (event: React.FormEvent) => {
      event.preventDefault();
      if (!isFormValid()) return;

      setIsSubmitting(true);
      try {
        if (checkProjectNameExists(formData.projectName)) {
          setErrors((prev) => ({
            ...prev,
            projectName: "A project with this name already exists",
          }));
          return;
        }

        const { isOk, error, result } = await ProjectViewApi.createProject(formData);

        if (isOk) {
          console.log("Project created successfully:", result);
          if (result) {
            setAllProjects([result, ...allProjects]);
          }
          handleCloseNewProjectForm();
        } else {
          console.error("Failed to create project:", error);
        }
      } catch (err) {
        console.error("Error creating project:", err);
      } finally {
        setIsSubmitting(false);
      }
    },
    [formData, isFormValid, checkProjectNameExists, handleCloseNewProjectForm]
  );

  const createChangeHandler = useCallback(
    (field: keyof NewProjectFormData) => (val: string) => {
      setFormData((prev) => ({ ...prev, [field]: val }));
      setTimeout(() => validateField(field, val), 300);
    },
    [validateField]
  );

  const handleProjectNameChange = createChangeHandler("projectName");
  const handleDataPathChange = createChangeHandler("dataPath");
  const handleQuamPathChange = createChangeHandler("quamPath");
  const handleCalibrationPathChange = createChangeHandler("calibrationPath");

  return (
    <div className={styles.createProjectPanel}>
      <h3 className={styles.header}>Create New Project</h3>
      <ProjectFormField
        id="project_name"
        label="Project name*"
        placeholder="Enter project name"
        value={formData.projectName}
        onChange={handleProjectNameChange}
        error={errors.projectName}
      />
      <ProjectFormField
        id="data_path"
        label="Data path"
        placeholder="Enter data path"
        value={formData.dataPath ?? ""}
        onChange={handleDataPathChange}
        error={errors.dataPath}
      />
      <ProjectFormField
        id="quam_state_path"
        label="QUAM state path"
        placeholder="Enter QUAM path"
        value={formData.quamPath ?? ""}
        onChange={handleQuamPathChange}
        error={errors.quamPath}
      />
      <ProjectFormField
        id="calibration_library_path"
        label="Calibration library path"
        placeholder="Enter calibration path"
        value={formData.calibrationPath ?? ""}
        onChange={handleCalibrationPathChange}
        error={errors.calibrationPath}
      />
      <div className={styles.actions}>
        <button type="button" onClick={handleCloseNewProjectForm} className={styles.cancel} disabled={isSubmitting}>
          Cancel
        </button>
        <button type="submit" onClick={handleSubmit} className={styles.create} disabled={!isFormValid() || isSubmitting}>
          {isSubmitting ? "Creating..." : "Create"}
        </button>
      </div>
    </div>
  );
};

export default CreateNewProjectForm;
