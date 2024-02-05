import { jobParameterData, jobsDiff, jobsListData, workflowListData } from "./jobs.data";
import JobsApi from "./JobsApi";
import cyKeys from "../../../src/utils/cyKeys";

export default class JobsController {
  static openNew() {
    cy.getByDataCy(cyKeys.JOBS_TAB).click();
  }
  static getJobs() {
    JobsApi.getAllJobs(true, { body: jobsListData }).as("jobs.list");
    return "jobs.list";
  }

  static interceptWorkflows() {
    JobsApi.getWorkflowList(true, { body: workflowListData }).as("workflows.list");

    return "workflows.list";
  }

  static interceptJobParameter(jobId = 1) {
    JobsApi.getJobsParameters(jobId, true, { body: jobParameterData }).as("job.parameter");

    return "job.parameter";
  }

  static interceptDiff() {
    JobsApi.getJobsDiff(true, { body: jobsDiff }).as("job.diff");

    return "job.diff";
  }
}
