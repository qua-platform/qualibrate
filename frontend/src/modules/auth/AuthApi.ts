import { AUTH_INFO, AUTH_VERIFY, LOGIN, LOGOUT } from "../../utils/api/apiRoutes";

import { API_METHODS } from "../../DEPRECATED_common/DEPRECATED_enum/Api";
import Api from "../../utils/api";
import { BASIC_HEADERS } from "../../utils/api/apiConsts";
import { Res } from "../../DEPRECATED_common/DEPRECATED_interfaces/Api";
import { LoginData, UserInfo } from "./types";

export class AuthApi extends Api {
  constructor() {
    super();
  }

  static api(path: string): string {
    return this.address + path;
  }

  static login(data: LoginData): Promise<Res<void>> {
    return this._fetch(this.api(LOGIN), API_METHODS.POST, {
      body: new URLSearchParams(`username=${data.username}&password=${data.password}`),
      headers: BASIC_HEADERS,
    });
  }

  static logout() {
    return this._fetch(this.api(LOGOUT), API_METHODS.GET);
  }

  static verify(): Promise<Res<void>> {
    return this._fetch(this.api(AUTH_VERIFY), API_METHODS.GET, {
      headers: BASIC_HEADERS,
    });
  }

  static getUserInfo(): Promise<Res<UserInfo>> {
    return this._fetch(this.api(AUTH_INFO), API_METHODS.GET, {
      headers: BASIC_HEADERS,
    });
  }
}
