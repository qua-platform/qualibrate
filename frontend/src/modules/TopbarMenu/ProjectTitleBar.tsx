import React, { useState, useCallback } from "react";
// eslint-disable-next-line css-modules/no-unused-class
import styles from "./styles/TitleBarMenu.module.scss";
import { NEW_PROJECT_BUTTON_VISIBLE } from "../../dev.config";
import NewProjectButtonIcon from "../../ui-lib/Icons/NewProjectButtonIcon";
import CreateNewProjectForm from "../Project/CreateNewProjectForm/CreateNewProjectForm";

const ProjectTitleBar: React.FC = () => {
  const [showCreatePanel, setShowCreatePanel] = useState(false);

  const handleTogglePanel = useCallback(() => {
    setShowCreatePanel(prev => !prev);
  }, []);

  const handleCancel = useCallback(() => {
    setShowCreatePanel(false);
  }, []);

  if (!NEW_PROJECT_BUTTON_VISIBLE) {
    return null;
  }

  return (
    <div className={styles.createProjectWrapper}>
      <button 
        title="Create new project" 
        onClick={handleTogglePanel} 
        className={styles.createProjectButton}
      >
        <NewProjectButtonIcon />
      </button>
      {showCreatePanel && (
        <div className={styles.createProjectPanelWrapper}>
          <CreateNewProjectForm onCancel={handleCancel} />
        </div>
      )}
    </div>
  );
};

export default ProjectTitleBar;
