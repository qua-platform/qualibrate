import React, { useState } from "react";
import styles from "./CreateNewProjectForm.module.scss";
import InputField from "../../../common/ui-components/common/Input/InputField";

interface Props {
  onCancel: () => void;
}

const CreateNewProjectForm: React.FC<Props> = ({ onCancel }) => {
  const [dataPath, setDataPath] = useState("");
  const [quamPath, setQuamPath] = useState("");
  const [calibrationPath, setCalibrationPath] = useState("");
  const [projectPath, setProjectPath] = useState("");

  const handleCancel = () => {
    setDataPath("");
    setQuamPath("");
    setCalibrationPath("");
    onCancel();
  };
  
  const handleCreate = () => {
    // Placeholder for backend integration
  };

  return (
    <div className={styles.createProjectPanel}>
      <h3 className={styles.header}>Create New Project</h3>

      <label>Project name</label>
      <InputField type="text" placeholder="Enter project name" value={projectPath} onChange={(val: string) => setProjectPath(val)} />

      <label>Data path</label>
      <InputField type="text" placeholder="Enter data path" value={dataPath} onChange={(val: string) => setDataPath(val)} />

      <label>QUAM state path</label>
      <InputField type="text" placeholder="Enter QUAM path" value={quamPath} onChange={(val: string) => setQuamPath(val)} />

      <label>Calibration library path</label>
      <InputField type="text" placeholder="Enter calibration path" value={calibrationPath} onChange={(val: string) => setCalibrationPath(val)} />

      <div className={styles.actions}>
        <button onClick={handleCancel} className={styles.cancel}>Cancel</button>
        <button onClick={handleCreate} className={styles.create}>Create</button>
      </div>
    </div>
  );
};

export default CreateNewProjectForm;