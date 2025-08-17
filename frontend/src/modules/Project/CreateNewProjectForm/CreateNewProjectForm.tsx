import React, { useState, useCallback } from "react";
import styles from "./CreateNewProjectForm.module.scss";
import ProjectFormField from "../../../common/ui-components/common/Input/ProjectFormField";

interface Props {
  onCancel: () => void;
}

const CreateNewProjectForm: React.FC<Props> = ({ onCancel }) => {
  const [dataPath, setDataPath] = useState("");
  const [quamPath, setQuamPath] = useState("");
  const [calibrationPath, setCalibrationPath] = useState("");
  const [projectPath, setProjectPath] = useState("");

  const handleCancel = useCallback(() => {
    setProjectPath("");
    setDataPath("");
    setQuamPath("");
    setCalibrationPath("");
    onCancel();
  }, [onCancel]);
  
  const handleCreate = useCallback(() => {
    // TODO: Implement backend integration
  }, []);

  const handleProjectPathChange = useCallback((val: string) => {
    setProjectPath(val);
  }, []);

  const handleDataPathChange = useCallback((val: string) => {
    setDataPath(val);
  }, []);

  const handleQuamPathChange = useCallback((val: string) => {
    setQuamPath(val);
  }, []);

  const handleCalibrationPathChange = useCallback((val: string) => {
    setCalibrationPath(val);
  }, []);

  const isFormValid = useCallback(() => {
    return projectPath.trim() !== "" && 
           dataPath.trim() !== "" && 
           quamPath.trim() !== "" && 
           calibrationPath.trim() !== "";
  }, [projectPath, dataPath, quamPath, calibrationPath]);

  return (
    <div className={styles.createProjectPanel}>
      <h3 className={styles.header}>Create New Project</h3>

      <ProjectFormField label="Project name" placeholder="Enter project name" value={projectPath} onChange={handleProjectPathChange} />

      <ProjectFormField label="Data path" placeholder="Enter data path" value={dataPath} onChange={handleDataPathChange} />

      <ProjectFormField label="QUAM state path" placeholder="Enter QUAM path" value={quamPath} onChange={handleQuamPathChange} />

      <ProjectFormField label="Calibration library path" placeholder="Enter calibration path" value={calibrationPath} onChange={handleCalibrationPathChange} />

      <div className={styles.actions}>
        <button onClick={handleCancel} className={styles.cancel}>Cancel</button>
        <button onClick={handleCreate} className={styles.create} disabled={!isFormValid()}>Create</button>
      </div>
    </div>
  );
};

export default CreateNewProjectForm;