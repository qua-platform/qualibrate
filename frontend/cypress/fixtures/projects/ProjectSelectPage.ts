import ProjectsApi from "./ProjectsApi";
import { ProjectsListData } from "./projects.data";
import AuthController from "../AuthController";
import cyKeys from "../../../src/utils/cyKeys";

export default class ProjectSelectPage {
  static openFirstProjectWithAuth() {
    cy.clearLocalStorage();
    ProjectsApi.getProjects("admin", true, {
      body: ProjectsListData,
    }).as("projects");
    AuthController.authenticate();
    cy.wait("@projects");
    cy.getByDataCy(cyKeys.projects.PROJECT).first().click();
    cy.getByDataCy(cyKeys.projects.LETS_START_BUTTON).click();
  }

  static goTo() {
    cy.getByDataCy(cyKeys.HOME_PAGE).click();
    cy.getByDataCy(cyKeys.projectPopup.CHANGE_PROJECT).click();
  }

  static checkProjectsCount() {
    cy.getByDataCy(cyKeys.projects.PROJECT).should("have.length", ProjectsListData.length);
  }
}
