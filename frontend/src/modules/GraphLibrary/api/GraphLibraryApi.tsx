import Api, { BASIC_HEADERS } from "../../../utils/api";
import { Res } from "../../../common/interfaces/Api";
import {
  ALL_GRAPHS,
  GET_EXECUTION_HISTORY,
  GET_LAST_RUN_WORKFLOW_STATUS,
  GET_WORKFLOW_GRAPH,
  SUBMIT_WORKFLOW_RUN,
} from "../../../utils/api/apiRoutes";
import { API_METHODS } from "../../../common/enums/Api";
import { Measurement } from "../components/GraphStatus/context/GraphStatusContext";
import { ErrorObject } from "../../common/Error/ErrorStatusWrapper";

export class GraphLibraryApi extends Api {
  constructor() {
    super();
  }

  static api(path: string): string {
    return this.address + path;
  }

  static fetchAllGraphs(rescan: boolean = false): Promise<Res<void>> {
    return this._fetch(this.api(ALL_GRAPHS()), API_METHODS.GET, {
      headers: BASIC_HEADERS,
      queryParams: { rescan },
    });
  }

  static fetchGraph(name: string): Promise<Res<void>> {
    return this._fetch(this.api(GET_WORKFLOW_GRAPH()), API_METHODS.GET, {
      headers: BASIC_HEADERS,
      queryParams: { name },
    });
  }

  static submitWorkflow(name: string, workflow: unknown): Promise<Res<string>> {
    return this._fetch(this.api(SUBMIT_WORKFLOW_RUN()), API_METHODS.POST, {
      headers: BASIC_HEADERS,
      body: JSON.stringify(workflow),
      queryParams: { name },
    });
  }

  static fetchExecutionHistory(): Promise<Res<{ items: Measurement[] }>> {
    return this._fetch(this.api(GET_EXECUTION_HISTORY()), API_METHODS.GET, {
      headers: BASIC_HEADERS,
    });
  }

  static fetchLastWorkflowStatus(): Promise<
    Res<{
      active: boolean;
      active_node_name: string;
      nodes_completed: number;
      nodes_total: number;
      run_duration: number;
      error: ErrorObject;
      run_results: { parameters: { nodes: { [key: string]: string }[] } };
    }>
  > {
    return this._fetch(this.api(GET_LAST_RUN_WORKFLOW_STATUS()), API_METHODS.GET, {
      headers: BASIC_HEADERS,
    });
  }
}
