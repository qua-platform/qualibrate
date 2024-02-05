import { GET_ALL_JOBS_FILTER } from "../../src/DEPRECATED_common/DEPRECATED_requests/jobs.requests";

export default class DataApi {
  static getExperiments(isOk = true, options?: { [key: string]: any }) {
    const url = "**/" + GET_ALL_JOBS_FILTER + "**";

    return cy.intercept(url, {
      delay: 200,
      statusCode: isOk ? 200 : 501,
      ...options,
    });
  }
}
