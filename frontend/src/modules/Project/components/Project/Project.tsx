import React, { useCallback, useMemo } from "react";
import ProjectInfo from "./ProjectInfo";
import { classNames } from "../../../../utils/classnames";
// eslint-disable-next-line css-modules/no-unused-class
import styles from "./Project.module.scss";
import cyKeys from "../../../../utils/cyKeys";
import { getColorIndex } from "../../helpers";
import { colorPalette } from "../../constants";
import { ProjectDTO, getActiveProject } from "../../../../stores/ProjectStore";
import ProjectActions from "./ProjectActions";
import { useSelector } from "react-redux";

interface Props {
  isActive?: boolean;
  lastModifiedAt: string;
  project: ProjectDTO;
  selectedProject: ProjectDTO | undefined;
  setSelectedProject: React.Dispatch<React.SetStateAction<ProjectDTO | undefined>>;
}

const Project = ({ isActive = false, lastModifiedAt = "", project, selectedProject, setSelectedProject }: Props) => {
  const activeProject = useSelector(getActiveProject);
  const isCurrentProjectActive = activeProject?.name === project.name;
  const index = useMemo(() => getColorIndex(project.name), [project.name]);
  const projectColor = colorPalette[index];

  const handleOnClick = useCallback(
    (project: ProjectDTO) => {
      setSelectedProject(project);
    },
    [setSelectedProject]
  );

  return (
    <div className={styles.projectWrapper} data-testid={"project-wrapper-" + project.name}>
      <div
        className={classNames(styles.project, isActive && styles.projectActive, isCurrentProjectActive && styles.projectChecked)}
        onClick={() => handleOnClick(project)}
        data-cy={cyKeys.projects.PROJECT}
      >
        <ProjectInfo name={project.name} colorIcon={projectColor} date={lastModifiedAt ? new Date(lastModifiedAt) : undefined} />
        <ProjectActions isCurrentProject={isCurrentProjectActive} projectName={project.name} selectedProject={selectedProject} />
      </div>
    </div>
  );
};

export default Project;
