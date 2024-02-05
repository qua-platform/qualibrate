import { API_METHODS } from "../DEPRECATED_enum/Api";
import Api from "../../utils/api";
import { CREATE_USER, GET_ALL_USERS } from "../DEPRECATED_requests/users.requests";
import { UserAPIDTO, UserAPIErrorResponse, UserAPIRequestAndResponse } from "../../DEPRECATED_context/UserContext";

export class UserApi extends Api {
  constructor() {
    super();
  }

  static getUsers(): Promise<UserAPIDTO> {
    return this.fetchData(this.api(GET_ALL_USERS), API_METHODS.GET) as Promise<UserAPIDTO>;
  }
  static createUser(user: UserAPIRequestAndResponse): Promise<UserAPIRequestAndResponse | UserAPIErrorResponse> {
    return this.fetchData(this.api(CREATE_USER), API_METHODS.POST, {
      queryParams: {},
      body: JSON.stringify(user),
    }) as Promise<UserAPIRequestAndResponse | UserAPIErrorResponse>;
  }
}
