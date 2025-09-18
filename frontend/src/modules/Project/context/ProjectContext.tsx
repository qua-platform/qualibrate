import React, { useCallback, useContext, useEffect, useState } from "react";
import noop from "../../../common/helpers";
import { ProjectViewApi } from "../api/ProjectViewAPI";
import { ProjectDTO } from "../ProjectDTO";

interface IProjectContext {
  allProjects: ProjectDTO[];
  activeProject: ProjectDTO | undefined;
  handleSelectActiveProject: (projectName: ProjectDTO) => void;
}

const ProjectContext = React.createContext<IProjectContext>({
  allProjects: [],
  handleSelectActiveProject: noop,
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
    if (isOk && result) {
      setAllProjects(result);
    } else if (error) {
      console.log(error);
    }
  }, []);

  const fetchActiveProject = useCallback(async () => {
    const { isOk, error, result } = await ProjectViewApi.fetchActiveProjectName();
    if (isOk && result) {
      const activeProject = allProjects.find((el) => el.name === result);
      if (activeProject) {
        setActiveProject(activeProject);
      } else {
        console.log("ERROR: No active project with the name '" + result + "'");
      }
    } else if (error) {
      console.log(error);
    }
  }, [allProjects]);

  useEffect(() => {
    fetchAllProjects();
  }, []);

  useEffect(() => {
    fetchActiveProject();
  }, [allProjects]);

  const handleSelectActiveProject = useCallback(
    async (project: ProjectDTO) => {
      try {
        const { isOk, result } = await ProjectViewApi.selectActiveProject(project.name);
        if (isOk && result === project.name) {
          setActiveProject(project);
        }
      } catch (err) {
        console.error("Failed to activate project:", err);
      }
    },
    [setActiveProject]
  );

  return (
    <ProjectContext.Provider
      value={{
        allProjects,
        activeProject,
        handleSelectActiveProject,
      }}
    >
      {props.children}
    </ProjectContext.Provider>
  );
}
