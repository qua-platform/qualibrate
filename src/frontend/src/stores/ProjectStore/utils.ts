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

export const testDatabase = (dbInfo: DatabaseDTO) => {
  try {
    return ProjectViewApi.testDatabase(dbInfo);
  } catch (e) {
    console.error(
      `Testing database connection failed for database name=${dbInfo.database} on the host=${dbInfo.host}, requested parameters=${JSON.stringify(dbInfo)}`,
      e
    );
    return null;
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

export const editProject = (projectInfo: CreateEditProjectDTO) => {
  try {
    return ProjectViewApi.updateProject(projectInfo);
  } catch (e) {
    console.error(`Failed to update project with name=${projectInfo.projectName}`, e);
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
