import Api, { BASIC_HEADERS } from "../../../utils/api";
import { Res } from "../../../common/interfaces/Api";
import { ALL_NODES, GET_LAST_RUN, IS_NODE_RUNNING, SUBMIT_NODE_RUN } from "../../../utils/api/apiRoutes";
import { API_METHODS } from "../../../common/enums/Api";

export class NodesApi extends Api {
  constructor() {
    super();
  }

  static api(path: string): string {
    return this.address + path;
  }

  static fetchAllNodes(): Promise<Res<void>> {
    return this._fetch(this.api(ALL_NODES()), API_METHODS.GET, {
      headers: BASIC_HEADERS,
    });
  }

  static submitNodeParameters(
    nodeName: string,
    inputParameter: {
      [key: string]: string | number | boolean | null;
    }
  ): Promise<Res<void>> {
    return this._fetch(this.api(SUBMIT_NODE_RUN()), API_METHODS.POST, {
      headers: BASIC_HEADERS,
      body: JSON.stringify(inputParameter),
      queryParams: { name: nodeName },
    });
  }

  static fetchLastRunInfo(): Promise<Res<unknown>> {
    return this._fetch(this.api(GET_LAST_RUN()), API_METHODS.GET, {
      headers: BASIC_HEADERS,
    });
  }

  static checkIsNodeRunning(): Promise<Res<boolean>> {
    return this._fetch(this.api(IS_NODE_RUNNING()), API_METHODS.GET, {
      headers: BASIC_HEADERS,
    });
  }
}
