import React from "react";
import styles from "./styles/TitleBarMenu.module.scss";
import { NEW_PROJECT_BUTTON_VISIBLE } from "../../dev.config";
import NewProjectButtonIcon from "../../ui-lib/Icons/NewProjectButtonIcon";

const ProjectTitleBar: React.FC = () => {
  if (!NEW_PROJECT_BUTTON_VISIBLE) {
    return null;
  }

  return (
    <button className={styles.createProjectButton} title="Create new project">
      <NewProjectButtonIcon />
    </button>
  );
};

export default ProjectTitleBar;
