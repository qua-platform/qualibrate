import { ProjectParams, RequestEntry } from "../../../../utils/api/types";
import { API_METHODS } from "../../../../DEPRECATED_common/DEPRECATED_enum/Api";
import Api from "../../../../utils/api";
import { PRes } from "../../../../DEPRECATED_common/DEPRECATED_interfaces/Api";
import { ExperimentSchemaDTO, ParametersDTO } from "../../types";

const paths = {
  GET_PARAMETERS: (runtimeId?: number): RequestEntry => [`runtime/${runtimeId || 1}/parameters`, API_METHODS.GET],
  GET_SCHEMA: (runtimeId?: number): RequestEntry => [`runtime/${runtimeId || 1}/schema`, API_METHODS.GET],
  GET_LOGS: (runtimeId?: number): RequestEntry => [`runtime/${runtimeId || 1}/logfile`, API_METHODS.GET],
  PATCH_PARAMS: (runtimeId?: number): RequestEntry => [`runtime/${runtimeId || 1}/parameters`, API_METHODS.PATCH],
};
export class NodeApi extends Api {
  constructor() {
    super();
  }

  static getLogs({ node_name, project_id, runtime_id = 1 }: ProjectParams & { node_name: string }): PRes<string> {
    const queryParams = { node_name, project_id };
    return this.fetch(paths.GET_LOGS(runtime_id), { queryParams });
  }

  static getSchema({
    node_class_name,
    project_id,
    runtime_id = 1,
  }: ProjectParams & { node_class_name: string }): PRes<ExperimentSchemaDTO> {
    const queryParams = { node_class_name, project_id };
    return this.fetch(paths.GET_SCHEMA(runtime_id), {
      queryParams,
    });
  }

  static getParameters({ project_id, runtime_id = 1 }: ProjectParams): PRes<ParametersDTO> {
    return this.fetch(paths.GET_PARAMETERS(runtime_id), {
      queryParams: { project_id, parameters_file: "parameters.json" },
    });
  }

  static patchParameters({
    payload,
    parameters_node,
    runtime_id,
    project_id,
  }: ProjectParams & {
    payload: { [key: string]: any };
    parameters_node: string;
  }) {
    return this.fetch(paths.PATCH_PARAMS(runtime_id), {
      queryParams: {
        parameters_node,
        parameters_file: "parameters.json",
        project_id,
      },
      body: JSON.stringify(payload),
    });
  }
}
