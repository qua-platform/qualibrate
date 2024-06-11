import React, { useCallback, useContext, useEffect, useState } from "react";
import noop from "../../../common/helpers";
import { ProjectViewApi } from "../api/ProjectViewAPI";
import { ProjectDTO } from "../ProjectDTO";

interface IProjectContext {
  allProjects: ProjectDTO[];
  activeProject: ProjectDTO | undefined;
  selectActiveProject: (projectName: ProjectDTO) => void;
}

const ProjectContext = React.createContext<IProjectContext>({
  allProjects: [],
  selectActiveProject: noop,
  activeProject: undefined,
});

export const useProjectContext = (): IProjectContext => useContext<IProjectContext>(ProjectContext);

interface ProjectContextProviderProps {
  children: React.ReactNode;
}

export function ProjectContextProvider(props: ProjectContextProviderProps): React.ReactNode {
  const [activeProject, setActiveProject] = useState<ProjectDTO | undefined>(undefined);
  const [allProjects, setAllProjects] = useState<ProjectDTO[]>([]);

  const fetchAllProjects = useCallback(async () => {
    const { isOk, error, result } = await ProjectViewApi.fetchAllProjects();
    if (isOk) {
      setAllProjects(result!);
    } else if (error) {
      console.log(error);
    }
  }, []);

  const fetchActiveProject = useCallback(async () => {
    const { isOk, error, result } = await ProjectViewApi.fetchActiveProject();
    if (isOk) {
      setActiveProject(result!);
    } else if (error) {
      console.log(error);
    }
  }, []);

  useEffect(() => {
    fetchActiveProject();
    fetchAllProjects();
  }, []);

  const selectActiveProject = useCallback((project: ProjectDTO) => {
    setActiveProject(project);
    ProjectViewApi.setActiveProject(project.name);
  }, []);

  return (
    <ProjectContext.Provider
      value={{
        allProjects,
        activeProject,
        selectActiveProject,
      }}
    >
      {props.children}
    </ProjectContext.Provider>
  );
}

export default ProjectContext;
