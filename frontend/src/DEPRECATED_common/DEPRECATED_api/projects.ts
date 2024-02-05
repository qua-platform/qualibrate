import { API_METHODS } from "../DEPRECATED_enum/Api";
import Api from "../../utils/api";
import { ADD_USER_TO_PROJECT, GET_ALL_PROJECTS, GET_PROJECTS_BY_USERNAME } from "../DEPRECATED_requests/projects.request";
import { DTOResponse } from "../../modules/Experiments/types";
import { ProjectDTO } from "../DEPRECATED_dtos/project/project.dto";

export class ProjectsApi extends Api {
  constructor() {
    super();
  }

  static fetchProjects(username: string): Promise<ProjectDTO[]> {
    return this.fetchData(this.api(`${GET_PROJECTS_BY_USERNAME(username)}`), API_METHODS.GET) as Promise<ProjectDTO[]>;
  }
  static fetchAllProjects(): Promise<DTOResponse> {
    return this.fetchData(this.api(`${GET_ALL_PROJECTS()}`), API_METHODS.GET, {
      queryParams: {},
    }) as Promise<DTOResponse>;
  }
  static addUserToProject(projectId: number, username: string): Promise<DTOResponse> {
    return this.fetchData(this.api(`${ADD_USER_TO_PROJECT(projectId)}`), API_METHODS.PATCH, {
      body: JSON.stringify([username]),
    }) as Promise<DTOResponse>;
  }
}
