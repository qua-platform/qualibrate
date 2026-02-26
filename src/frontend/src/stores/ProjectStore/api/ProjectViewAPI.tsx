import Api, { BASIC_HEADERS } from "../../../utils/api";
import { API_METHODS, Res } from "../../../utils/api/types";
import {
  ACTIVE_PROJECT,
  ALL_PROJECTS,
  CONNECT_DB,
  CREATE_PROJECT,
  DELETE_PROJECT,
  DISCONNECT_DB,
  SHOULD_REDIRECT_USER_TO_SPECIFIC_PAGE,
  TEST_DB_CONNECTION,
  UPDATE_PROJECT,
} from "../../../utils/api/apiRoutes";

export interface DatabaseDTO {
  isConnected?: boolean;
  host: string;
  port: number;
  name: string;
  username: string;
  password: string;
}

export interface CreateEditProjectDTO {
  projectName: string;
  dataPath?: string;
  quamPath?: string;
  calibrationPath?: string;
  database?: DatabaseDTO;
}

export interface NewProjectFormData {
  projectName: string;
  dataPath?: string;
  quamPath?: string;
  calibrationPath?: string;
}

interface ProjectApiDTO {
  page: string | null;
}

export interface ProjectDTO {
  name: string;
  nodes_number?: number;
  created_at?: string;
  last_modified_at?: string;
  dataPath: string;
  quamPath: string;
  calibrationPath: string;
  database?: DatabaseDTO;
  updates?: {
    qualibrate: {
      calibration_library: {
        folder: string;
      };
      storage: {
        location: string;
      };
    };
    quam: {
      state_path: string;
    };
  };
}

export class ProjectViewApi extends Api {
  constructor() {
    super();
  }

  static api(path: string): string {
    return this.address + path;
  }

  static fetchAllProjects(): Promise<Res<ProjectDTO[]>> {
    return this._fetch(this.api(ALL_PROJECTS()), API_METHODS.GET, {
      headers: BASIC_HEADERS,
    });
  }

  static fetchActiveProjectName(): Promise<Res<string>> {
    return this._fetch(this.api(ACTIVE_PROJECT()), API_METHODS.GET, {
      headers: BASIC_HEADERS,
    });
  }

  static fetchShouldRedirectUserToProjectPage(): Promise<Res<ProjectApiDTO>> {
    return this._fetch(this.api(SHOULD_REDIRECT_USER_TO_SPECIFIC_PAGE()), API_METHODS.GET, {
      headers: BASIC_HEADERS,
    });
  }

  static selectActiveProject(projectName: string): Promise<Res<string>> {
    return this._fetch(this.api(ACTIVE_PROJECT()), API_METHODS.POST, {
      headers: BASIC_HEADERS,
      body: JSON.stringify(projectName),
    });
  }

  static testDatabase(dbInfo: DatabaseDTO): Promise<Res<ProjectDTO>> {
    return this._fetch(this.api(TEST_DB_CONNECTION()), API_METHODS.POST, {
      headers: BASIC_HEADERS,
      body: JSON.stringify(dbInfo),
      // queryParams: { project_name: formData.projectName },
    });
  }

  static connectToProjectDB(dbInfo: DatabaseDTO): Promise<Res<ProjectDTO>> {
    return this._fetch(this.api(CONNECT_DB()), API_METHODS.POST, {
      headers: BASIC_HEADERS,
      body: JSON.stringify(dbInfo),
      // queryParams: { project_name: formData.projectName },
    });
  }

  static disconnectToProjectDB(dbInfo: DatabaseDTO): Promise<Res<ProjectDTO>> {
    return this._fetch(this.api(DISCONNECT_DB()), API_METHODS.POST, {
      headers: BASIC_HEADERS,
      body: JSON.stringify(dbInfo),
      // queryParams: { project_name: formData.projectName },
    });
  }

  static createProject(projectInfo: CreateEditProjectDTO): Promise<Res<ProjectDTO>> {
    const body = {
      // ...(projectInfo.projectName && { project_name: projectInfo.projectName }),
      ...(projectInfo.dataPath && { storage_location: projectInfo.dataPath }),
      ...(projectInfo.calibrationPath && { calibration_library_folder: projectInfo.calibrationPath }),
      ...(projectInfo.quamPath && { quam_state_path: projectInfo.quamPath }),
      ...(projectInfo.database && { database: projectInfo.database }),
    };

    return this._fetch(this.api(CREATE_PROJECT()), API_METHODS.POST, {
      headers: BASIC_HEADERS,
      body: JSON.stringify(body),
      queryParams: {project_name: projectInfo.projectName},
    });
  }

  static updateProject(_oldProjectName: string, projectInfo: CreateEditProjectDTO): Promise<Res<ProjectDTO>> {
    const body = {
      // ...(projectInfo.projectName && { project_name: projectInfo.projectName }),
      ...(projectInfo.dataPath && {storage_location: projectInfo.dataPath}),
      ...(projectInfo.calibrationPath && {calibration_library_folder: projectInfo.calibrationPath}),
      ...(projectInfo.quamPath && {quam_state_path: projectInfo.quamPath}),
      ...(projectInfo.database && {database: projectInfo.database}),
    };

    return this._fetch(this.api(UPDATE_PROJECT()), API_METHODS.POST, {
      headers: BASIC_HEADERS,
      body: JSON.stringify(body),
      // queryParams: { project_name: oldProjectName },
    });
  }

  static deleteProject(projectName: string): Promise<Res<{ status: boolean }>> {
    return this._fetch(this.api(DELETE_PROJECT()), API_METHODS.POST, {
      headers: BASIC_HEADERS,
      queryParams: {project_name: projectName},
    });
  }
}
