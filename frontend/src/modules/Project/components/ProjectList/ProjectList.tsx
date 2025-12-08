import Project from "../Project/Project"; // eslint-disable-next-line css-modules/no-unused-class
import styles from "./ProjectList.module.scss";
import React, { useMemo } from "react";
import { ProjectDTO } from "../../ProjectDTO";
import LoadingBar from "../../../../components/Loader/LoadingBar";
import { NoItemsIcon } from "../../../../components/Icons/NoItemsIcon";
import { useSelector } from "react-redux";
import { getIsScanningProjects } from "../../../../stores/ProjectStore/selectors";

interface Props {
  projects: ProjectDTO[];
  selectedProject: ProjectDTO | undefined;
  setSelectedProject: React.Dispatch<React.SetStateAction<ProjectDTO | undefined>>;
}

const ProjectList = ({ projects, selectedProject, setSelectedProject }: Props) => {
  const isScanningProjects = useSelector(getIsScanningProjects);

  const sortedProjects = useMemo(() => {
    return [...projects].sort((a, b) => new Date(b.last_modified_at).getTime() - new Date(a.last_modified_at).getTime());
  }, [projects]);

  if (!isScanningProjects && projects?.length === 0) {
    return (
      <div className={styles.splashNoProject}>
        <LoadingBar icon={<NoItemsIcon height={204} width={200} />} text="No projects found" />
      </div>
    );
  }

  return (
    <div className={styles.splash}>
      {sortedProjects.map((project, index) => (
        <Project
          key={index}
          isActive={selectedProject?.name === project.name}
          project={project}
          lastModifiedAt={project.last_modified_at}
          selectedProject={selectedProject}
          setSelectedProject={setSelectedProject}
        />
      ))}
    </div>
  );
};

export default ProjectList;
