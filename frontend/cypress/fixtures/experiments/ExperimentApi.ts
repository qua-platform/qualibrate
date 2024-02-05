import { GET_WORKFLOW_PATH } from "../../../src/modules/Experiments/api/workflows.requests";

export default class ExperimentApi {
  static getExperimentWorkflow(runtimeId = 1, isOk = true, options?: { [key: string]: unknown }) {
    const url = "**/" + GET_WORKFLOW_PATH(runtimeId) + "**";

    return cy.intercept(url, {
      delay: 200,
      statusCode: isOk ? 200 : 501,
      ...options,
    });
  }
}
