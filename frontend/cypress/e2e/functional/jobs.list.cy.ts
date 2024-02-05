import cyKeys from "../../../src/utils/cyKeys";
import { jobsListData } from "../../fixtures/jobs/jobs.data";
import JobsController from "../../fixtures/jobs/JobsController";
import { click, componentExist, textExist } from "../../fixtures/common";
import JobsPage from "../../fixtures/jobs/JobsPage";
import ProjectSelectPage from "../../fixtures/projects/ProjectSelectPage";
import MakeScreenShot from "../../fixtures/screenShotHelpers";

context("Jobs page", () => {
  beforeEach(() => {
    ProjectSelectPage.openFirstProjectWithAuth();
    const w_alias = JobsController.interceptWorkflows();
    JobsController.interceptJobParameter();
    JobsController.getJobs();
    JobsController.openNew();
    cy.wait("@" + w_alias);
  });
  afterEach(() => {
    MakeScreenShot();
  });
  // it("Jobs list is displaying", () => {
  //   textExist("Job list");
  //   componentExist(cyKeys.jobs.WRAPPER);
  // });
  // it("Control buttons exist", () => {
  //   componentExist(cyKeys.jobs.ADD_JOB_BUTTON);
  //   componentExist(cyKeys.jobs.FILTER_BUTTON);
  //   componentExist(cyKeys.jobs.GROUP_SORT_BUTTON);
  //   componentExist(cyKeys.jobs.SELECT_JOB_BUTTON);
  //   componentExist(cyKeys.jobs.START_DATE_SORT_BUTTON);
  // });
  it("Opening job popup from existing workflow", () => {
    click(cyKeys.jobs.ADD_JOB_BUTTON);
    click(cyKeys.jobs.EXISTING_WORKFLOW_BUTTON);
    componentExist(cyKeys.jobs.ADD_JOB_POPUP);
  });
  // it("Opening filter job popup", () => {
  //   click(cyKeys.jobs.FILTER_BUTTON);
  //   componentExist(cyKeys.jobs.FILTER_JOBS_POPUP);
  // });
  // it("Rendering jobs list", () => {
  //   cy.getByDataCy(cyKeys.jobs.JOB_STEP_NAME).should(
  //     "have.length",
  //     jobsListData.length
  //   );
  //   cy.wait("@" + "jobs.list");
  // });
  // it("Opening job's content", () => {
  //   const firstJob = cy.getByDataCy(cyKeys.jobs.JOB_STEP_NAME).first();
  //   firstJob.click();
  //   cy.getByDataCy(cyKeys.jobs.JOB_PARAMETERS).contains("Parameters");
  //   cy.wait("@" + "job.parameter");
  // });
  // it("Grouping button works", () => {
  //   JobsPage.groupBy("workflow");
  //   JobsPage.groupBy("none");
  // });
  // it("Sorting button works", () => {
  //   JobsPage.sort("newest");
  //   JobsPage.sort("oldest");
  // });
});
