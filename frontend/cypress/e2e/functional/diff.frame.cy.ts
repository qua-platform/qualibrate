import cyKeys from "../../../src/utils/cyKeys";
import { jobsListData } from "../../fixtures/jobs/jobs.data";
import JobsController from "../../fixtures/jobs/JobsController";
import { textExist } from "../../fixtures/common";
import JobsPage from "../../fixtures/jobs/JobsPage";
import DiffPage from "../../fixtures/jobs/DiffPage";
import ProjectSelectPage from "../../fixtures/projects/ProjectSelectPage";
import MakeScreenShot from "../../fixtures/screenShotHelpers";

context.skip("Diff view", () => {
  beforeEach(() => {
    ProjectSelectPage.openFirstProjectWithAuth();
    const w_alias = JobsController.interceptWorkflows();
    const p_alias = JobsController.getJobs();
    JobsController.openNew();
    cy.wait("@" + w_alias);
    cy.wait("@" + p_alias);
  });
  afterEach(() => {
    MakeScreenShot();
  });
  it("User can submit jobs for diffing", () => {
    const d_alias = JobsController.interceptDiff();
    JobsPage.compareNJobs(2);
    textExist("Diff is loading");

    cy.wait("@" + d_alias);
    cy.getByDataCy(cyKeys.jobs.DIFF_ROW);
  });
  it("User can select jobs for diffing", () => {
    JobsPage.compareNJobs(jobsListData.length);
    const d_alias = JobsController.interceptDiff();
    DiffPage.selectJobs(1, 2);
    textExist("Diff is loading");

    cy.wait("@" + d_alias);
    cy.getByDataCy(cyKeys.jobs.DIFF_ROW);
  });
});
