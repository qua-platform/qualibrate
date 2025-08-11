import React, { useCallback, useContext, useEffect, useState } from "react";
import noop from "../../../common/helpers";
import { ProjectViewApi } from "../api/ProjectViewAPI";
import { ProjectDTO } from "../ProjectDTO";
import Project from "../components/Project";

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

export const ProjectContextProvider: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const [activeProject, setActiveProject] = useState<ProjectDTO | undefined>(undefined);
  const [allProjects, setAllProjects] = useState<ProjectDTO[]>([]);

  const fetchProjectsAndActive = async () => {
    try {
      const [projectsRes, activeNameRes] = await Promise.all([
        ProjectViewApi.fetchAllProjects(),
        ProjectViewApi.fetchActiveProject(),
      ]);
  
      if (projectsRes.isOk && projectsRes.result) {
        const all = projectsRes.result as ProjectDTO[];
        setAllProjects(all);
        let active: ProjectDTO | undefined = undefined;
        if (activeNameRes.isOk && activeNameRes.result) {
          active = all.find(p => p.name === activeNameRes.result);
          // If not found, fall back to first project
          if (!active && all.length > 0) {
            active = all[0];
          }
        } else if (all.length > 0) {
          active = all[0];
        }
        setActiveProject(active);
      }
    } catch (error) {
      console.error("Error fetching projects or active project:", error);
    }
  };

  useEffect(() => {
    fetchProjectsAndActive();
  }, []);

  const selectActiveProject = useCallback((project: ProjectDTO) => {
    setActiveProject(project);
    ProjectViewApi.setActiveProject(project.name);
  }, []);

  return (
    <ProjectContext.Provider value={{ allProjects, activeProject, selectActiveProject }}>
      {children}
    </ProjectContext.Provider>
  );
};

export default ProjectContext;
