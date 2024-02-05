import { typeByDataCy } from "./common";
import cyKeys from "../../src/utils/cyKeys";
import ApiIntercept from "./Api";

export const COOKIE_VALUE =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFkbWluIiwidXNlcl9pZCI6MSwiZXhwIjoxNjU3MjY3MjkxfQ.PyKDRl_qdIvo2coEV3rOWmYmHDeC-QhWBpMrv4YFsMI";
export default class AuthController {
  static authenticate() {
    ApiIntercept.loginVerify(true).as("verify");
    ApiIntercept.userInfo().as("userInfo");
    cy.visit("/");
    cy.wait("@verify");
    cy.wait("@userInfo");
  }

  static fillForm(user: string, password: string) {
    typeByDataCy(cyKeys.login.USERNAME, user);
    typeByDataCy(cyKeys.login.PASSWORD, password);
  }

  static login() {
    cy.getByDataCy(cyKeys.login.SUBMIT).click();
  }

  static interceptGood() {
    return ApiIntercept.login(true);
  }

  static interceptVerifyOk() {
    return ApiIntercept.loginVerify(true);
  }

  static checkCookie() {
    cy.getCookies().then((cookie) => {
      // expect(cookies[0]).to.have.property("value", COOKIE_VALUE);
    });
  }
}
