import Api, { BASIC_HEADERS } from "../../../utils/api";
import { API_METHODS, Res } from "../../../utils/api/types";
import {
  ACTIVE_PROJECT,
  ALL_PROJECTS,
  CREATE_PROJECT,
  DELETE_PROJECT,
  TEST_DB_CONNECTION,
  UPDATE_PROJECT,
} from "../../../utils/api/apiRoutes";

export interface DatabaseStateDTO {
  is_connected?: boolean;
}
export interface DatabaseDTO {
  is_connected?: boolean;
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  database_state?: {
    is_connected?: boolean;
  };
}

export interface CreateEditProjectDTO {
  projectName: string;
  dataPath?: string;
  quamPath?: string;
  calibrationPath?: string;
  database?: DatabaseDTO;
  database_state?: DatabaseStateDTO;
}

export interface NewProjectFormData {
  projectName: string;
  dataPath?: string;
  quamPath?: string;
  calibrationPath?: string;
}

export interface ProjectDTO {
  name: string;
  nodes_number?: number;
  created_at?: string;
  last_modified_at?: string;
  dataPath: string;
  quamPath: string;
  calibrationPath: string;
  updates?: {
    qualibrate: {
      calibration_library: {
        folder: string;
      };
      storage: {
        location: string;
      };
      database?: DatabaseDTO;
      database_state?: DatabaseDTO;
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

  static selectActiveProject(projectName: string): Promise<Res<string>> {
    return this._fetch(this.api(ACTIVE_PROJECT()), API_METHODS.POST, {
      headers: BASIC_HEADERS,
      body: JSON.stringify(projectName),
    });
  }

  static testDatabase(dbInfo: DatabaseDTO): Promise<Res<true>> {
    return this._fetch(this.api(TEST_DB_CONNECTION()), API_METHODS.POST, {
      headers: BASIC_HEADERS,
      body: JSON.stringify(dbInfo),
    });
  }

  static createProject(projectInfo: CreateEditProjectDTO): Promise<Res<ProjectDTO>> {
    const body = {
      ...(projectInfo.dataPath && { storage_location: projectInfo.dataPath }),
      ...(projectInfo.calibrationPath && { calibration_library_folder: projectInfo.calibrationPath }),
      ...(projectInfo.quamPath && { quam_state_path: projectInfo.quamPath }),
      ...(projectInfo.database && { database: projectInfo.database }),
    };

    return this._fetch(this.api(CREATE_PROJECT()), API_METHODS.POST, {
      headers: BASIC_HEADERS,
      body: JSON.stringify(body),
      queryParams: { project_name: projectInfo.projectName },
    });
  }

  static updateProject(projectInfo: CreateEditProjectDTO): Promise<Res<ProjectDTO>> {
    const body = {
      ...(projectInfo.dataPath && { storage_location: projectInfo.dataPath }),
      ...(projectInfo.calibrationPath && { calibration_library_folder: projectInfo.calibrationPath }),
      ...(projectInfo.quamPath && { quam_state_path: projectInfo.quamPath }),
      ...(projectInfo.database && { database: projectInfo.database }),
    };

    return this._fetch(this.api(UPDATE_PROJECT()), API_METHODS.PUT, {
      headers: BASIC_HEADERS,
      body: JSON.stringify(body),
      // queryParams: { project_name: projectInfo.projectName },
    });
  }

  static deleteProject(projectName: string): Promise<Res<{ status: boolean }>> {
    return this._fetch(this.api(DELETE_PROJECT(projectName)), API_METHODS.DELETE, {
      headers: BASIC_HEADERS,
    });
  }
}
