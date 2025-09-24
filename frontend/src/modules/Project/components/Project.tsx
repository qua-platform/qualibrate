import React, { useCallback, useMemo } from "react";
import ProjectInfo from "./ProjectInfo";
import { classNames } from "../../../utils/classnames";
// eslint-disable-next-line css-modules/no-unused-class
import styles from "./Project.module.scss";
import cyKeys from "../../../utils/cyKeys";
import { getColorIndex } from "../helpers";
import { colorPalette } from "../constants";
import { useProjectContext } from "../context/ProjectContext";
import ProjectActions from "./ProjectActions";

interface Props {
  showRuntime?: boolean;
  isActive?: boolean;
  onClick?: (name: string) => void;
  projectId?: number;
  name?: string;
  lastModifiedAt: string;
}

const Project = ({ showRuntime = false, isActive = false, onClick, name = "", lastModifiedAt = "" }: Props) => {
  const { activeProject } = useProjectContext();
  const isCurrentProject = activeProject?.name === name;
  const index = useMemo(() => getColorIndex(name), [name]);
  const projectColor = colorPalette[index];
  const handleOnClick = useCallback(() => {
    if (!onClick) {
      return;
    }

    onClick(name);
  }, [onClick, name]);

  return (
    <div className={styles.projectWrapper}>
      <button
        className={classNames(
          styles.project,
          isActive && styles.projectActive,
          isCurrentProject && styles.projectChecked
        )}
        onClick={handleOnClick}
        data-cy={cyKeys.projects.PROJECT}
      >
        <ProjectInfo
          name={name}
          colorIcon={projectColor}
          date={lastModifiedAt ? new Date(lastModifiedAt) : undefined}
        />
        <ProjectActions isCurrentProject={isCurrentProject} showRuntime={showRuntime} />
      </button>
    </div>
  );
};

export default Project;
