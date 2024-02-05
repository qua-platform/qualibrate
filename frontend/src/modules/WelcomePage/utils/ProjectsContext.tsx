import React, { PropsWithChildren, useCallback, useContext, useEffect, useState } from "react";

import { ProjectDTO } from "../../../DEPRECATED_common/DEPRECATED_dtos/project/project.dto";
import { ProjectsApi } from "../../../DEPRECATED_common/DEPRECATED_api/projects";
import { useAuthContext } from "../../auth/AuthContext";

interface IProjectsContext {
  activeProject?: ProjectDTO;
  setActiveProject: (project: ProjectDTO) => void;
  fetchUserProjects: (username?: string) => void;
  fetchAllProjects: () => void;
  userProjects: ProjectDTO[];
  allProjects: ProjectDTO[];
}

const ProjectsContext = React.createContext<IProjectsContext | any>(null);

export const useProjectsContext = (): IProjectsContext => useContext<IProjectsContext>(ProjectsContext);

export function ProjectsContextProvider(props: PropsWithChildren<void>): React.ReactElement {
  const { children } = props;
  const { userInfo } = useAuthContext();
  const [activeProject, setActiveProject] = useState<ProjectDTO | undefined>(undefined);

  const [userProjects, setUserProjects] = useState<ProjectDTO[]>([]);
  const [allProjects, setAllProjects] = useState<ProjectDTO[]>([]);

  const fetchUserProjects = useCallback(
    async (username?: string) => {
      if (userInfo) {
        const res = await ProjectsApi.fetchProjects(username ?? userInfo.username);
        if (res) {
          setUserProjects(res);
        }
      }
    },
    [userInfo]
  );

  const fetchAllProjects = useCallback(async () => {
    if (userInfo) {
      const { items } = await ProjectsApi.fetchAllProjects();
      if (items) {
        setAllProjects(items as ProjectDTO[]);
      }
    }
  }, [userInfo]);

  useEffect(() => {
    fetchUserProjects();
  }, [fetchUserProjects]);

  useEffect(() => {
    fetchAllProjects();
  }, [fetchAllProjects]);

  return (
    <ProjectsContext.Provider
      value={{
        activeProject,
        setActiveProject,
        fetchUserProjects,
        userProjects,
        allProjects,
      }}
    >
      {children}
    </ProjectsContext.Provider>
  );
}
