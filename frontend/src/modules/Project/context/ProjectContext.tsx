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

export const ProjectContextProvider: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const [activeProject, setActiveProject] = useState<ProjectDTO | undefined>(undefined);
  const [allProjects, setAllProjects] = useState<ProjectDTO[]>([]);

  const fetchProjectsAndActive = useCallback(async () => {
    const [projectsRes, activeNameRes] = await Promise.all([
      ProjectViewApi.fetchAllProjects(),
      ProjectViewApi.fetchActiveProject(),
    ]);

    if (projectsRes.isOk && projectsRes.result && activeNameRes.isOk && activeNameRes.result) {
      const all = projectsRes.result as ProjectDTO[];
      const activeName = activeNameRes.result;
      const active = activeName ? all.find((p) => p.name === activeName) : undefined;

      setAllProjects(all);
      setActiveProject(active ?? all[0]);
      return;
    }

    // fallback in case of failure or empty results
    const fallback: ProjectDTO = {
      name: "My Project",
      created_at: new Date().toISOString(),
      last_modified_at: new Date().toISOString(),
      nodes_number: 1,
    };
    setAllProjects([fallback]);
    setActiveProject(fallback);
  }, []);

  useEffect(() => {
    fetchProjectsAndActive();
  }, [fetchProjectsAndActive]);

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
