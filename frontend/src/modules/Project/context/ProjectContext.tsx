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

export const ProjectContextProvider: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const [activeProject, setActiveProject] = useState<ProjectDTO | undefined>(undefined);
  const [allProjects, setAllProjects] = useState<ProjectDTO[]>([]);

  const fetchProjectsAndActive = useCallback(async () => {
    try {
      const [projectsRes, activeNameRes] = await Promise.all([ProjectViewApi.fetchAllProjects(), ProjectViewApi.fetchActiveProjectName()]);

      if (projectsRes.isOk && projectsRes.result) {
        const fetchedProjects = projectsRes.result;
        setAllProjects(fetchedProjects);
        let fetchedActiveProject: ProjectDTO | undefined = undefined;
        if (activeNameRes.isOk && activeNameRes.result) {
          fetchedActiveProject = fetchedProjects.find((p) => p.name === activeNameRes.result);
          if (!fetchedActiveProject && fetchedProjects.length > 0) {
            fetchedActiveProject = fetchedProjects[0];
          }
        } else if (fetchedProjects.length > 0) {
          fetchedActiveProject = fetchedProjects[0];
        }
        setActiveProject(fetchedActiveProject);
      }
    } catch (error) {
      console.error("Error fetching projects or active project:", error);
    }
  }, [allProjects]);

  useEffect(() => {
    fetchProjectsAndActive();
  }, []);

  const handleSelectActiveProject = useCallback(
    async (project: ProjectDTO) => {
      const previousProject = { ...(activeProject as ProjectDTO) };
      setActiveProject(project);
      try {
        const { isOk, result } = await ProjectViewApi.selectActiveProject(project.name);
        if (!isOk || (result !== project.name && previousProject)) {
          setActiveProject(previousProject);
        }
      } catch (err) {
        console.error("Failed to select active project:", err);
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
      {children}
    </ProjectContext.Provider>
  );
};

export default ProjectContext;
