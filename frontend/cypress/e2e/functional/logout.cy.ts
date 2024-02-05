import cyKeys from "../../../src/utils/cyKeys";
import ProjectSelectPage from "../../fixtures/projects/ProjectSelectPage";

context("Logout", () => {
  beforeEach(() => {
    ProjectSelectPage.openFirstProjectWithAuth();
  });
  it("User can logout from the application", () => {
    cy.getByDataCy(cyKeys.login.LOGOUT_BUTTON).click();
    cy.getByDataCy(cyKeys.LOGIN_PAGE);
  });
});
