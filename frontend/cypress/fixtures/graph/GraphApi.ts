import { GET_WORKFLOW_PATH } from "../../../src/modules/Experiments/api/workflows.requests";
import { GET_SCHEMA, PATCH_PARAMETERS } from "../../../src/modules/Experiments/api/experiments.request";
import { RequestBody } from "./types";

export default class GraphApi {
  static getExperimentWorkflow(runtimeId = 1, isOk = true, options?: RequestBody) {
    const url = "**/" + GET_WORKFLOW_PATH(runtimeId) + "**";

    return cy.intercept(url, {
      delay: 200,
      statusCode: isOk ? 200 : 501,
      ...options,
    });
  }

  static getParameters(options: RequestBody, parameters_file, runtimeId = 1) {
    const url = `**/runtime/${runtimeId || 1}/parameters**`;

    return cy.intercept("GET", url, {
      delay: 200,
      ...options,
    });
  }

  static patchParameters(options: RequestBody, runtimeId = 1) {
    const url = "**/" + PATCH_PARAMETERS(runtimeId) + "**";

    return cy.intercept(url, {
      delay: 200,
      method: "PATCH",
      ...options,
    });
  }

  static getSchema(options: RequestBody, node_class_name?: string, runtimeId = 1) {
    const url = "**/" + GET_SCHEMA(runtimeId) + "**";

    return cy.intercept(url, {
      delay: 200,
      ...options,
    });
  }
}
