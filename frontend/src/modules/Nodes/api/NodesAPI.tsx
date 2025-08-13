import Api, { BASIC_HEADERS } from "../../../utils/api";
import { Res } from "../../../common/interfaces/Api";
import {
  ALL_NODES,
  GET_LAST_RUN,
  GET_LAST_RUN_STATUS,
  GET_LOGS,
  IS_NODE_RUNNING,
  STOP_RUNNING,
  SUBMIT_NODE_RUN,
} from "../../../utils/api/apiRoutes";
import { API_METHODS } from "../../../common/enums/Api";
import { LastRunStatusGraphResponseDTO, LastRunStatusNodeResponseDTO } from "../../TopbarMenu/constants";
import { LogsViewerResponseDTO } from "../../RightSidebar/context/RightSidePanelContext";

export class NodesApi extends Api {
  constructor() {
    super();
  }

  static api(path: string): string {
    return this.address + path;
  }

  static fetchAllNodes(rescan: boolean = true): Promise<Res<void>> {
    return this._fetch(this.api(ALL_NODES()), API_METHODS.GET, {
      headers: BASIC_HEADERS,
      queryParams: { rescan },
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

  static fetchLastRunStatusInfo(): Promise<
    Res<{
      node: LastRunStatusNodeResponseDTO;
      graph: LastRunStatusGraphResponseDTO;
    }>
  > {
    return this._fetch(this.api(GET_LAST_RUN_STATUS()), API_METHODS.GET, {
      headers: BASIC_HEADERS,
    });
  }

  static checkIsNodeRunning(): Promise<Res<boolean>> {
    return this._fetch(this.api(IS_NODE_RUNNING()), API_METHODS.GET, {
      headers: BASIC_HEADERS,
    });
  }

  static stopRunningGraph(): Promise<Res<void>> {
    return this._fetch(this.api(STOP_RUNNING()), API_METHODS.POST, {
      headers: BASIC_HEADERS,
    });
  }

  static getLogs(
    after: string | null = null,
    before: string | null = null,
    num_entries: string = "300",
    reverse: boolean = true
  ): Promise<Res<LogsViewerResponseDTO[]>> {
    return this._fetch(this.api(GET_LOGS({ after, before, num_entries, reverse })), API_METHODS.GET, {
      headers: BASIC_HEADERS,
    });
  }
}
