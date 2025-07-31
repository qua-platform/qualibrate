import LoadingBar from "../../../ui-lib/loader/LoadingBar";
import { NoItemsIcon } from "../../../ui-lib/Icons/NoItemsIcon";
import Project from "./Project";
// eslint-disable-next-line css-modules/no-unused-class
import styles from "./Project.module.scss";
import React from "react";
import { ProjectDTO } from "../ProjectDTO";
import Divider from "../../../ui-lib/components/Bar/Divider";

interface Props {
  projects: ProjectDTO[];
  selectedProject: ProjectDTO | undefined;
  setSelectedProject: React.Dispatch<React.SetStateAction<ProjectDTO | undefined>>;
}

const ProjectList = ({ projects, selectedProject, setSelectedProject }: Props) => {
  if (!projects?.length) {
    return (
      <div className={styles.splash}>
        <LoadingBar icon={<NoItemsIcon />} text="No projects yet" />
      </div>
    );
  }

  return (
    <div className={styles.splash}>
      {[...projects]
        .sort((a, b) => new Date(b.last_modified_at).getTime() - new Date(a.last_modified_at).getTime())
        .map((project, index) => (
        <React.Fragment key={index}>
          <Project
            isActive={selectedProject?.name === project.name}
            projectId={index}
            name={project.name}
            onClick={() => setSelectedProject(project)}
            lastModifiedAt={project.last_modified_at}
          />
          <Divider width={855} marginLeft={55} />
        </React.Fragment>
      ))}
    </div>
  );
};

export default ProjectList;
