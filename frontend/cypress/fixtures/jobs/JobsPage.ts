import cyKeys from "../../../src/utils/cyKeys";

export default class JobsPage {
  static groupBy(option: "workflow" | "date" | "none") {
    cy.getByDataCy(cyKeys.jobs.GROUP_SORT_BUTTON).click();

    const list = cy.getByDataCy(cyKeys.jobs.GROUP_SORT_BUTTON).findByDataCy(cyKeys.common.DROPDOWN_LIST).find("div");

    switch (option) {
      case "workflow":
        list.eq(0).click();
        return;
      case "date":
        list.eq(1).click();
        return;
      case "none":
        list.eq(2).click();
    }
  }

  static sort(option: "oldest" | "newest") {
    cy.getByDataCy(cyKeys.jobs.START_DATE_SORT_BUTTON).click();

    const list = cy.getByDataCy(cyKeys.jobs.START_DATE_SORT_BUTTON).findByDataCy(cyKeys.common.DROPDOWN_LIST).find("div");

    switch (option) {
      case "oldest":
        list.eq(1).click();
        return;
      case "newest":
        list.eq(0).click();
        return;
    }
  }

  static selectNJobs(n: number) {
    cy.getByDataCy(cyKeys.jobs.SELECT_JOB_BUTTON).click();

    for (let jobId = 0; jobId < n; jobId++) {
      cy.getByDataCy(cyKeys.jobs.SELECT_CHECKBOX).eq(jobId).click();
    }
  }

  static compareNJobs(n: number) {
    JobsPage.selectNJobs(n);
    cy.getByDataCy(cyKeys.jobs.COMPARE_BUTTON).click();
  }
}
