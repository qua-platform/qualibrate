import Api, { BASIC_HEADERS } from "../../../utils/api";
import { Res } from "../../../utils/api/types";
import { ACTIVE_PROJECT, ALL_PROJECTS, CREATE_PROJECT, SHOULD_REDIRECT_USER_TO_SPECIFIC_PAGE } from "../../../utils/api/apiRoutes";
import { API_METHODS } from "../../../utils/api/types";

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
  nodes_number: number;
  created_at: string;
  updates: object;
  last_modified_at: string;
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

  static createProject(formData: NewProjectFormData): Promise<Res<ProjectDTO>> {
    const body = {
      ...(formData.dataPath && { storage_location: formData.dataPath }),
      ...(formData.calibrationPath && { calibration_library_folder: formData.calibrationPath }),
      ...(formData.quamPath && { quam_state_path: formData.quamPath }),
    };

    return this._fetch(this.api(CREATE_PROJECT()), API_METHODS.POST, {
      headers: BASIC_HEADERS,
      body: JSON.stringify(body),
      queryParams: { project_name: formData.projectName },
    });
  }
}
