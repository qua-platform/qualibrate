import { GET_PROJECTS_BY_USERNAME } from "../../../src/DEPRECATED_common/DEPRECATED_requests/projects.request";

export default class ProjectsApi {
  static getProjects(username = "admin", isOk = true, options?: { [key: string]: any }) {
    const url = "**/" + GET_PROJECTS_BY_USERNAME(username);

    return cy.intercept(url, {
      delay: 200,
      statusCode: isOk ? 200 : 501,
      ...options,
    });
  }
}
