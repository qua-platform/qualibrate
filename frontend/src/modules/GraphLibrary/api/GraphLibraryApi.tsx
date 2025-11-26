import Api, { BASIC_HEADERS } from "../../../utils/api";
import { Res } from "../../../common/interfaces/Api";
import { ALL_GRAPHS, GET_EXECUTION_HISTORY, GET_WORKFLOW_GRAPH, SUBMIT_WORKFLOW_RUN } from "../../../utils/api/apiRoutes";
import { API_METHODS } from "../../../common/enums/Api";
import { Measurement } from "../components/GraphStatus/GraphStatus";

type NodeDTO = {
  id: number
  data: {
    label: string
    subgraph?: FetchGraphResponse
  }
  position: {
    x: number
    y: number
  }
}

type EdgeDTO = {
  id: string
  source: number
  target: number
  data: {
    condition: boolean
  }
  position: {
    x: number
    y: number
  }
}

export type FetchGraphResponse = {
  nodes: NodeDTO[],
  edges: EdgeDTO[]
}

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

  static fetchGraph(name: string): Promise<Res<FetchGraphResponse>> {
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
}
