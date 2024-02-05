import FlexLayout from "../../fixtures/FlexLayout";
import cyKeys from "../../../src/utils/cyKeys";
import ProjectSelectPage from "../../fixtures/projects/ProjectSelectPage";
import MakeScreenShot from "../../fixtures/screenShotHelpers";

context("Navigation", () => {
  beforeEach(() => {
    ProjectSelectPage.openFirstProjectWithAuth();
  });
  it("Routes", () => {
    FlexLayout.getTabByIndex(0).contains("Experiments", { matchCase: false });
    cy.getByDataCy(cyKeys.DASHBOARD_TAB).click();
    FlexLayout.getTabByIndex(1).contains("Dashboard", { matchCase: false });
    cy.getByDataCy(cyKeys.DATA_TAB).click();
    FlexLayout.getTabByIndex(2).contains("Data", { matchCase: false });
    cy.getByDataCy(cyKeys.NOTEBOOK_TAB).click();
    FlexLayout.getTabByIndex(3).contains("Notebook", { matchCase: false });
  });
});
