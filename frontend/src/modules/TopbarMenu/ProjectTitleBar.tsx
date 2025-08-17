import React, { useState } from "react";
// eslint-disable-next-line css-modules/no-unused-class
import styles from "./styles/TitleBarMenu.module.scss";
import { NEW_PROJECT_BUTTON_VISIBLE } from "../../dev.config";
import NewProjectButtonIcon from "../../ui-lib/Icons/NewProjectButtonIcon";
import CreateNewProjectForm from "../Project/CreateNewProjectForm/CreateNewProjectForm";

const ProjectTitleBar: React.FC = () => {
  const [showCreatePanel, setShowCreatePanel] = useState(false);

  if (!NEW_PROJECT_BUTTON_VISIBLE) {
    return null;
  }

  return (
    <div className={styles.createProjectWrapper}>
      <button 
        title="Create new project" 
        onClick={() => setShowCreatePanel(prev => !prev)} 
        className={styles.createProjectButton}
      >
        <NewProjectButtonIcon />
      </button>
      {showCreatePanel && (
        <div className={styles.createProjectPanelWrapper}>
          <CreateNewProjectForm onCancel={() => setShowCreatePanel(false)} />
        </div>
      )}
    </div>
  );
};

export default ProjectTitleBar;
