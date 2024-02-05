import { COOKIE_VALUE } from "./AuthController";
import { AUTH_INFO, AUTH_VERIFY } from "../../src/utils/api/apiRoutes";
import { UserInfo } from "../../src/modules/auth/types";

type Args = {
  error?: string;
  options?: { [key: string]: any };
};

export default class ApiIntercept {
  private static _formOptions(args: Args = {}): object {
    return {
      statusCode: args.error ? 500 : 200,
      ...args.options,
    };
  }

  private static _intercept(path: string, args: Args, body?: any) {
    return cy.intercept(path, {
      ...ApiIntercept._formOptions(args),
      throttleKbps: 1000,
      body: JSON.stringify(body || {}),
    });
  }
  static login(isOk = true, options?: { [key: string]: any }): Cypress.Chainable {
    const expiresYear = new Date().getFullYear() + 1;
    return cy.intercept("**/auth/login", {
      delay: 2000,
      statusCode: isOk ? 200 : 501,
      ...options,
      headers: isOk
        ? {
            "set-cookie": `access_token=${COOKIE_VALUE}; expires=Fri, 08 Jul ${expiresYear} 08:01:31 GMT; Path=/; SameSite=none; Secure`,
          }
        : {},
    });
  }

  static loginVerify(isOk = true): Cypress.Chainable {
    return cy.intercept("**/" + AUTH_VERIFY, {
      delay: 1000,
      statusCode: isOk ? 200 : 501,
    });
  }

  static userInfo(args: Args = {}): Cypress.Chainable {
    const USER_INFO: UserInfo = {
      name: "name",
      surname: "surname",
      email: "a@qe.we",
      id: 1,
      username: "admin",
    };
    return ApiIntercept._intercept(AUTH_INFO, args, USER_INFO);
  }
}
