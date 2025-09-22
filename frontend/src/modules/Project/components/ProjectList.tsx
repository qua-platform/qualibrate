import Project from "./Project"; // eslint-disable-next-line css-modules/no-unused-class
import styles from "./Project.module.scss";
import React, { useCallback, useMemo } from "react";
import { ProjectDTO } from "../ProjectDTO";
import LoaderPage from "../../../ui-lib/loader/LoaderPage";

interface Props {
  projects: ProjectDTO[];
  selectedProject: ProjectDTO | undefined;
  setSelectedProject: React.Dispatch<React.SetStateAction<ProjectDTO | undefined>>;
}

const ProjectList = ({ projects, selectedProject, setSelectedProject }: Props) => {
  const sortedProjects = useMemo(() => {
    return [...projects].sort((a, b) => new Date(b.last_modified_at).getTime() - new Date(a.last_modified_at).getTime());
  }, [projects]);

  const handleOnClick = useCallback(
    (project: ProjectDTO) => {
      setSelectedProject(project);
    },
    [setSelectedProject]
  );

  if (!projects?.length) {
    return (
      <div className={styles.splash}>
        <LoaderPage />;
      </div>
    );
  }

  return (
    <div className={styles.splash}>
      {sortedProjects.map((project, index) => (
        <Project
          key={index}
          isActive={selectedProject?.name === project.name}
          projectId={index}
          name={project.name}
          onClick={() => handleOnClick(project)}
          lastModifiedAt={project.last_modified_at}
        />
      ))}
    </div>
  );
};

export default ProjectList;
