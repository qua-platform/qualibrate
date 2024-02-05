import { CREATE_WORKFLOW, GET_ALL_WORKFLOWS, GET_WORKFLOW_PATH } from "./workflows.requests";

import { API_METHODS } from "../../../DEPRECATED_common/DEPRECATED_enum/Api";
import Api from "../../../utils/api";
import { Res } from "../../../DEPRECATED_common/DEPRECATED_interfaces/Api";
import { DTOResponse, WorkflowGraphDTO } from "../types";

export class WorkflowApi extends Api {
  constructor() {
    super();
  }

  static getWorkflows(submit_order: "descending" | "ascending"): Promise<Res<DTOResponse>> {
    const queryParams = { submit_order: submit_order ?? "descending" };
    return this._fetch(this.api(GET_ALL_WORKFLOWS), API_METHODS.GET, {
      queryParams,
    });
  }

  // static getWorkflowById(id: number): Promise<Res<WorkflowDTO>> {
  //   return this._fetch(this.api(GET_WORKFLOW_BY_ID(id)), API_METHODS.GET);
  // }

  static getWorkflowGraph({
    runtimeId,
    ...queryParams
  }: {
    workflow_path: string;
    project_id: string | number;
    runtimeId: number;
  }): Promise<Res<WorkflowGraphDTO>> {
    return this._fetch(this.api(GET_WORKFLOW_PATH(runtimeId)), API_METHODS.GET, {
      queryParams,
    });
  }

  static createEmptyWorkflow(project_id: string | number, runtimeId = 1): Promise<Res<any>> {
    return this._fetch(this.api(CREATE_WORKFLOW(runtimeId)), API_METHODS.POST, {
      queryParams: { project_id },
    });
  }
}
