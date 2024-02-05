import React, { useCallback } from "react";

import ProjectInfo from "./ProjectInfo";
import SelectField from "../../../DEPRECATED_components/common/Input/SelectField";
import { classNames } from "../../../utils/classnames";
import styles from "./Project.module.scss";
import cyKeys from "../../../utils/cyKeys";

const SelectRuntime = <SelectField options={["Localhost"]} onChange={() => {}} />;

interface Props {
  showRuntime?: boolean;
  isActive?: boolean;
  onClick?: (projectId: number) => void;
  projectId?: number;
  name?: string;
}

const Project = ({ showRuntime = true, isActive = false, onClick, projectId = -1, name = "" }: Props) => {
  const handleOnClick = useCallback(() => {
    if (!onClick) {
      return;
    }

    onClick(projectId);
  }, [onClick]);

  return (
    <button
      className={classNames(styles.project, isActive && styles.project_active)}
      onClick={handleOnClick}
      data-cy={cyKeys.projects.PROJECT}
    >
      <ProjectInfo name={name} />
      <div className={styles.projectActions}>{showRuntime && SelectRuntime}</div>
    </button>
  );
};

export default Project;
