import { CODE_SERVER_INIT, CODE_SERVER_PING, GET_AUTOCOMPLETE, MY_CODE_SERVER, RESOLVE_BY_EUI } from "./experiments.request";

import { API_METHODS } from "../../../DEPRECATED_common/DEPRECATED_enum/Api";
import Api from "../../../utils/api";
import { Res } from "../../../DEPRECATED_common/DEPRECATED_interfaces/Api";
import { EUI } from "../../Jobs/types";

export class ExperimentApi extends Api {
  constructor() {
    super();
  }

  static getCodeServerUrl(): Promise<Res<string>> {
    return this._fetch(this.api(MY_CODE_SERVER), API_METHODS.GET);
  }

  static pingCodeServer(): Promise<Res<string>> {
    return this._fetch(this.api(CODE_SERVER_PING), API_METHODS.GET);
  }

  // static initCodeServer(): Promise<Res<boolean>> {
  //   return this._fetch(this.api(CODE_SERVER_INIT), API_METHODS.GET);
  // }

  static getAutoCompleteByEUI(job_eui: string) {
    const queryParams = { job_eui };
    return this._fetch<Array<string>>(this.api(GET_AUTOCOMPLETE), API_METHODS.GET, {
      queryParams,
    });
  }

  static resolveByEUI(path: EUI) {
    const body = { path };
    return this._fetch<string>(this.api(RESOLVE_BY_EUI), API_METHODS.POST, {
      body: JSON.stringify(body),
      queryParams: { node_output_idx: -1 },
    });
  }
}
