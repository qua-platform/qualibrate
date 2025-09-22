import Api, { BASIC_HEADERS } from "../../../utils/api";
import { Res } from "../../../common/interfaces/Api";
import { ACTIVE_PROJECT, ALL_PROJECTS, CREATE_PROJECT } from "../../../utils/api/apiRoutes";
import { API_METHODS } from "../../../common/enums/Api";
import { ProjectDTO } from "../ProjectDTO";

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

  static createProject(formData: {
    projectName: string;
    dataPath: string;
    calibrationPath: string;
    quamPath: string;
  }): Promise<Res<string>> {
    return this._fetch(this.api(CREATE_PROJECT()), API_METHODS.POST, {
      headers: BASIC_HEADERS,
      body: JSON.stringify({
        storage_location: formData.dataPath,
        calibration_library_folder: formData.calibrationPath,
        quam_state_path: formData.quamPath,
      }),
      queryParams: { project_name: formData.projectName },
    });
  }
}
