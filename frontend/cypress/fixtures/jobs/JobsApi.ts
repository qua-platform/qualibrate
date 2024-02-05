import {
  DIFF_JOBS_BY_EUI,
  GET_ALL_JOBS_FILTER,
  GET_JOB_PARAMETERS,
} from "../../../src/DEPRECATED_common/DEPRECATED_requests/jobs.requests";

import { GET_ALL_WORKFLOWS } from "../../../src/modules/Experiments/api/workflows.requests";
import cyKeys from "../../../src/utils/cyKeys";

const JOBS_DEFAULT_SORTING_REQUEST = "?start_date_order=descending&use_workflow_in_search=false";

const WORKFLOWS_DEFAULT_SORTING_REQUEST = "?submit_order=descending";

export default class JobsApi {
  static getWorkflowList(isOk = true, options?: { [key: string]: any }) {
    const url = "**/" + GET_ALL_WORKFLOWS + WORKFLOWS_DEFAULT_SORTING_REQUEST;

    return cy.intercept(url, {
      delay: 200,
      statusCode: isOk ? 200 : 501,
      ...options,
    });
  }

  static getJobsList(isOk = true, options?: { [key: string]: any }) {
    const url = "**/" + GET_ALL_JOBS_FILTER + JOBS_DEFAULT_SORTING_REQUEST;

    return cy.intercept(url, {
      delay: 200,
      statusCode: isOk ? 200 : 501,
      ...options,
    });
  }

  static getAllJobs(isOk = true, options?: { [key: string]: any }) {
    const url = "**/" + GET_ALL_JOBS_FILTER + "**";

    return cy.intercept(url, {
      delay: 200,
      statusCode: isOk ? 200 : 501,
      ...options,
    });
  }

  static getJobsParameters(jobId = 1, isOk = true, options?: { [key: string]: any }) {
    const url = "**/" + GET_JOB_PARAMETERS(jobId) + "**";

    return cy.intercept(url, {
      delay: 200,
      statusCode: isOk ? 200 : 501,
      ...options,
    });
  }

  static getJobsDiff(isOk = true, options?: { [key: string]: any }) {
    const url = "**/" + DIFF_JOBS_BY_EUI + "**";

    return cy.intercept(url, {
      delay: 1000,
      statusCode: isOk ? 200 : 501,
      ...options,
    });
  }
}
