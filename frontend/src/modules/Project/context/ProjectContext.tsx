import React, { useCallback, useContext, useEffect, useState } from "react";
import noop from "../../../common/helpers";
import { ProjectViewApi } from "../api/ProjectViewAPI";
import { ProjectDTO } from "../ProjectDTO";

interface IProjectContext {
  allProjects: ProjectDTO[];
  handleSelectActiveProject: (projectName: ProjectDTO) => void;
  activeProject: ProjectDTO | null | undefined;
  isScanningProjects: boolean;
}

const ProjectContext = React.createContext<IProjectContext>({
  allProjects: [],
  handleSelectActiveProject: noop,
  activeProject: undefined,
  isScanningProjects: false,
});

export const useProjectContext = (): IProjectContext => useContext<IProjectContext>(ProjectContext);

export const ProjectContextProvider: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const [activeProject, setActiveProject] = useState<ProjectDTO | null | undefined>(undefined);
  const [allProjects, setAllProjects] = useState<ProjectDTO[]>([]);
  const [isScanningProjects, setIsScanningProjects] = useState<boolean>(false);

  const fetchProjectsAndActive = async () => {
    setIsScanningProjects(true);
    try {
      const [projectsRes, activeNameRes] = await Promise.all([ProjectViewApi.fetchAllProjects(), ProjectViewApi.fetchActiveProjectName()]);

      if (projectsRes.isOk && projectsRes.result) {
        const fetchedProjects = projectsRes.result;
        setAllProjects(fetchedProjects);
        if (activeNameRes.isOk && activeNameRes.result) {
          const fetchedActiveProject = fetchedProjects.find((p) => p.name === activeNameRes.result);
          setActiveProject(fetchedActiveProject);
        }
      }
    } catch (error) {
      console.error("Error fetching projects or active project:", error);
    }
    setIsScanningProjects(false);
  };

  useEffect(() => {
    fetchProjectsAndActive();
  }, []);

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
        isScanningProjects,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};
