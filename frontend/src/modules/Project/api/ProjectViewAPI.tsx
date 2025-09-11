import Api, { BASIC_HEADERS } from "../../../utils/api";
import { Res } from "../../../common/interfaces/Api";
import { ACTIVE_PROJECT, ALL_PROJECTS } from "../../../utils/api/apiRoutes";
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
}
