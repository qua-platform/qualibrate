import AuthController from "../../fixtures/AuthController";
import MakeScreenShot from "../../fixtures/screenShotHelpers";
import ApiIntercept from "../../fixtures/Api";

// TODO Fix this test
context.skip("Login", () => {
  beforeEach(() => {
    ApiIntercept.loginVerify(false).as("verify");
    cy.clearLocalStorage();
    cy.visit("/login");
    cy.wait("@verify");
  });
  afterEach(() => {
    MakeScreenShot();
  });
  it("Login successfully", () => {
    AuthController.interceptGood().as("login");
    AuthController.fillForm("admin", "password");
    MakeScreenShot("loginPage");
    AuthController.login();
    cy.wait("@login");
    cy.wait(2000);
    cy.contains("Welcome to EntropyLab", { matchCase: false });
    cy.contains("New to EntropyLab", { matchCase: false });
    AuthController.checkCookie();
  });
});
