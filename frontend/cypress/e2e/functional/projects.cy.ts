import ProjectSelectPage from "../../fixtures/projects/ProjectSelectPage";
import MakeScreenShot from "../../fixtures/screenShotHelpers";

context("Projects", () => {
  afterEach(() => {
    MakeScreenShot();
  });
  it("Projects render correctly", () => {
    ProjectSelectPage.openFirstProjectWithAuth();
    ProjectSelectPage.goTo();
    ProjectSelectPage.checkProjectsCount();
  });
  it("Click on the projects triggers button state", () => {
    ProjectSelectPage.openFirstProjectWithAuth();
  });
});
