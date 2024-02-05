import cyKeys from "../../../src/utils/cyKeys";
import { ExperimentDataList } from "../../fixtures/experiments/experiment.data";
import DataApi from "../../fixtures/DataApi";
import ProjectSelectPage from "../../fixtures/projects/ProjectSelectPage";
import MakeScreenShot from "../../fixtures/screenShotHelpers";

// TODO Fix this tests
context("Data", () => {
  beforeEach(() => {
    ProjectSelectPage.openFirstProjectWithAuth();
  });
  afterEach(() => {
    MakeScreenShot();
  });
  it.skip("Menu opening", () => {
    cy.getByDataCy(cyKeys.DATA_TAB).click();
    cy.getByDataCy(cyKeys.data.MENU_BUTTON).click({ force: true });
    cy.getByDataCy(cyKeys.data.EXPERIMENT_LIST);
  });
  it.skip("Opening filter popup", () => {
    cy.getByDataCy(cyKeys.DATA_TAB).click();
    cy.getByDataCy(cyKeys.data.MENU_BUTTON).click({ force: true });
    cy.getByDataCy(cyKeys.data.FILTER_BUTTON).click();
    cy.getByDataCy(cyKeys.popup.FILTER_EXPERIMENTS_POPUP);
  });
  it.skip("JobEntry list render", () => {
    DataApi.getExperiments(true, { body: ExperimentDataList }).as("dataItems");
    cy.getByDataCy(cyKeys.DATA_TAB).click();
    cy.getByDataCy(cyKeys.data.MENU_BUTTON).click({ force: true });
    cy.wait("@dataItems");
    cy.getByDataCy(cyKeys.data.EXPERIMENT).should("have.length", 4);
  });
});
