import cyKeys from "../../../src/utils/cyKeys";
import ExperimentApi from "./ExperimentApi";
import { ExperimentWorkflow } from "./experiment.data";

export const tabsKeys = {
  CODE: cyKeys.experiment.WORKFLOW_CODE_BUTTON,
  SYSTEM: cyKeys.experiment.WORKFLOW_SYSTEM_BUTTON,
  WORKFLOW: cyKeys.experiment.WORKFLOW_VIEW_BUTTON,
};

export const viewKeys = {
  CODE: cyKeys.experiment.CODE_VIEW,
  SYSTEM: cyKeys.experiment.SYSTEM_VIEW,
  WORKFLOW: cyKeys.experiment.WORKFLOW_VIEW,
};

export default class ExperimentsPage {
  static openNew() {
    cy.getByDataCy(cyKeys.EXPERIMENTS_TAB).click();
  }

  static interceptAllGood(): string {
    ExperimentApi.getExperimentWorkflow(1, true, {
      body: ExperimentWorkflow,
    }).as("workflow");
    return "workflow";
  }

  static checkGraphExist() {
    cy.getByDataCy(cyKeys.experiment.GRAPH);
    cy.get("canvas").first();
  }

  static selectTab(tabCy: string) {
    cy.getByDataCy(tabCy).click();
  }

  static openGraphView() {
    this.selectTab(cyKeys.experiment.WORKFLOW_VIEW_BUTTON);
  }

  static checkView(viewCy: string) {
    cy.getByDataCy(viewCy).should("exist");
  }
}
