import AuthController from "../../fixtures/AuthController";
import { HOST_URL } from "./const";

context("Login", () => {
  beforeEach(() => {
    cy.visit(HOST_URL + "/login");
  });
  it("Login successfully", () => {
    AuthController.interceptGood().as("login");
    AuthController.fillForm("admin", "password");
    AuthController.login();
    cy.contains("Welcome to EntropyLab", { matchCase: false });
    cy.contains("New to EntropyLab", { matchCase: false });
    AuthController.checkCookie();
  });
});
