import React from "react";
import SelectField from "../../../common/ui-components/common/Input/SelectField";
import ProjectCheckIcon from "../../../ui-lib/Icons/ProjectCheckIcon";
// eslint-disable-next-line css-modules/no-unused-class
import styles from "./Project.module.scss";

const SelectRuntime = <SelectField options={["Localhost"]} onChange={() => {}} />;

interface ProjectActionsProps {
  isCurrentProject: boolean;
  showRuntime: boolean;
}

const ProjectActions: React.FC<ProjectActionsProps> = ({ isCurrentProject, showRuntime }) => {
  return (
    <div className={styles.projectActions}>
      <div className={styles.checkWrapper}>
        {isCurrentProject && <ProjectCheckIcon />}
      </div>
      {showRuntime && SelectRuntime}
    </div>
  );
};

export default ProjectActions;
