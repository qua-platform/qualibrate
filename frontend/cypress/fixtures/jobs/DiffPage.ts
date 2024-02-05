import cyKeys from "../../../src/utils/cyKeys";

export default class DiffPage {
  static selectJobs(a: number, b: number) {
    cy.getByDataCy(cyKeys.jobs.diff.SELECT).findByDataCy(cyKeys.common.DROPDOWN_BUTTON).eq(0).click();

    cy.getByDataCy(cyKeys.jobs.diff.SELECT_LIST_ITEM).eq(a).click();

    cy.getByDataCy(cyKeys.jobs.diff.SELECT).findByDataCy(cyKeys.common.DROPDOWN_BUTTON).eq(1).click();

    cy.getByDataCy(cyKeys.jobs.diff.SELECT_LIST_ITEM).eq(b).click();
  }
}
