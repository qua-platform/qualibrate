import Api, { BASIC_HEADERS } from "../../../utils/api";
import { Res } from "../../../common/interfaces/Api";
import { ACTIVE_PROJECT, ALL_PROJECTS, CREATE_PROJECT } from "../../../utils/api/apiRoutes";
import { API_METHODS } from "../../../common/enums/Api";

export class ProjectViewApi extends Api {
  constructor() {
    super();
  }

  static api(path: string): string {
    return this.address + path;
  }

  static fetchAllProjects(): Promise<Res<void>> {
    return this._fetch(this.api(ALL_PROJECTS()), API_METHODS.GET, {
      headers: BASIC_HEADERS,
    });
  }

  static fetchActiveProject(): Promise<Res<void>> {
    return this._fetch(this.api(ACTIVE_PROJECT()), API_METHODS.GET, {
      headers: BASIC_HEADERS,
    });
  }

  static setActiveProject(projectName: string): Promise<Res<void>> {
    return this._fetch(this.api(ACTIVE_PROJECT()), API_METHODS.POST, {
      headers: BASIC_HEADERS,
      body: JSON.stringify({ active_project: projectName }),
      queryParams: { active_project: projectName },
    });
  }

  static createProject(formData: {
    projectPath: string;
    dataPath: string;
    calibrationPath: string;
    quamPath: string;
  }): Promise<Res<string>> {
    return this._fetch(
      this.api(CREATE_PROJECT()),
      API_METHODS.POST,
      {
        headers: BASIC_HEADERS,
        body: JSON.stringify({
          storage_location: formData.dataPath,
          calibration_library_folder: formData.calibrationPath,
          quam_state_path: formData.quamPath,
        }),
        queryParams: { project_name: formData.projectPath },
      }
    );
  }
}
