import { CreateEditProjectDTO, DatabaseDTO, ProjectViewApi } from "./api/ProjectViewAPI";

export const fetchAllProjects = () => {
  try {
    return ProjectViewApi.fetchAllProjects();
  } catch (e) {
    console.error("Failed to fetch all projects", e);
    return undefined;
  }
};

export const fetchActiveProjectName = () => {
  try {
    return ProjectViewApi.fetchActiveProjectName();
  } catch (e) {
    console.error("Failed to fetch active project name", e);
    return undefined;
  }
};

// export const fetchShouldRedirectUserToProjectPage = () => {
//   try {
//     return ProjectViewApi.fetchShouldRedirectUserToProjectPage();
//   } catch (e) {
//     console.error("Failed to get the info if should redirection be done to project page", e);
//     return null;
//   }
// };

export const testDatabase = (dbInfo: DatabaseDTO) => {
  try {
    return ProjectViewApi.testDatabase(dbInfo);
  } catch (e) {
    console.error(
      `Testing database connection failed for database name=${dbInfo.name} on the host=${dbInfo.host}, requested parameters=${JSON.stringify(dbInfo)}`,
      e
    );
    return null;
  }
};

export const connectToProjectDB = (dbInfo: DatabaseDTO) => {
  try {
    return ProjectViewApi.connectToProjectDB(dbInfo);
  } catch (e) {
    console.error(
      `Failed to connect to database name=${dbInfo.name}, on host=${dbInfo.host}, requested parameters=${JSON.stringify(dbInfo)}`,
      e
    );
    return null;
  }
};

export const disconnectToProjectDB = (dbInfo: DatabaseDTO) => {
  try {
    return ProjectViewApi.disconnectToProjectDB(dbInfo);
  } catch (e) {
    console.error(
      `Failed to disconnect to database name=${dbInfo.name} on host=${dbInfo.host}, requested parameters=${JSON.stringify(dbInfo)}`,
      e
    );
    return undefined;
  }
};

export const createProject = (projectInfo: CreateEditProjectDTO) => {
  try {
    return ProjectViewApi.createProject(projectInfo);
  } catch (e) {
    console.error(`Failed to create new project with name=${projectInfo.projectName}`, e);
    return null;
  }
};

export const editProject = (oldProjectName: string, projectInfo: CreateEditProjectDTO) => {
  try {
    return ProjectViewApi.updateProject(oldProjectName, projectInfo);
  } catch (e) {
    console.error(`Failed to update project with name=${oldProjectName}`, e);
    return null;
  }
};

export const deleteProject = (projectName: string) => {
  try {
    return ProjectViewApi.deleteProject(projectName);
  } catch (e) {
    console.error(`Failed to remove project with name=${projectName}`, e);
    return null;
  }
};
