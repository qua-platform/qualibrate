import { textExist } from "../../fixtures/common";
import { HOST_URL } from "./const";

context("Demo sample test", () => {
  beforeEach(() => {
    cy.visit(HOST_URL);
  });
  it("Logo exists", () => {
    textExist("Welcome to EntropyLab!");
  });
});
