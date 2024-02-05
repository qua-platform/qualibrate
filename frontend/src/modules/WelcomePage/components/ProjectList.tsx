import LoadingBar from "../../../ui-lib/loader/LoadingBar";
import { NoItemsIcon } from "../../../ui-lib/Icons/NoItemsIcon";
import Project from "./Project";
import { ProjectDTO } from "../../../DEPRECATED_common/DEPRECATED_dtos/project/project.dto";
import styles from "./Project.module.scss";
import { useProjectsContext } from "../utils/ProjectsContext";

interface Props {
  projects: ProjectDTO[] | null;
}

const ProjectList = ({ projects }: Props) => {
  const { activeProject, setActiveProject } = useProjectsContext();

  if (!projects?.length) {
    return (
      <div className={styles.splash}>
        <LoadingBar icon={<NoItemsIcon />} text="No projects yet" />
      </div>
    );
  }

  return (
    <div className={styles.splash}>
      {projects?.map((project, index) => (
        <Project
          key={index}
          isActive={activeProject?.id === project.id}
          projectId={index}
          onClick={() => setActiveProject(project)}
          {...project}
        />
      ))}
    </div>
  );
};

export default ProjectList;
