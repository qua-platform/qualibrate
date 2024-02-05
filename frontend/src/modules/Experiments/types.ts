// todo reduce this type
import { EUI, JobDTO } from "../../DEPRECATED_common/DEPRECATED_dtos/job.dto";
import { ProjectDTO } from "../../DEPRECATED_common/DEPRECATED_dtos/project/project.dto";

export interface NodeDTO {
  data: NodeData;
}

export type NodeData = {
  [node_parameter: string]: string | { [key: string]: string };
  ident: string;
  name: string;
  id: string;
  value: string;
  label: string;
};

export type EdgeDTO = {
  data: {
    source: string;
    target: string;
  };
};
export interface DTOResponse {
  items: WorkflowDTO[] | JobDTO[] | ProjectDTO[];
  page: number;
  total_items: number;
  total_pages: number;
}
export interface WorkflowDTO {
  name: string;
  description: string;
  nodes: NodeDTO;
  commit: string;
  author_id: number;
  id: number;
  eui: EUI;
  time_created: Date;
}

export interface GraphDTO {
  data: [unknown];
  directed: boolean;
  multigraph: boolean;
  elements: {
    nodes: NodeDTO[];
    edges: EdgeDTO[];
  };
}

export interface WorkflowGraphDTO {
  name: string;
  description: string;
  graph: GraphDTO;
  icons: {
    [key: string]: string;
  };
  resolved_inputs: {
    [nodeId: string]: { [parameterName: string]: string };
  };
}

type NodeInputEntry = {
  description: {
    [key: string]: string;
  };
  units: {
    [key: string]: string;
  };
  type: {
    [key: string]: number;
  };
};

type NodeOutputEntry = {
  description: {
    [key: string]: string;
  };
  units: {
    [key: string]: string;
  };
  retention: {
    [key: string]: number;
  };
};

export interface ExperimentSchemaDTO {
  name: string;
  description: string;
  command: string;
  bin: string;
  dependancies: Array<any>;
  icon: string;
  inputs: NodeInputEntry[];
  outputs: NodeOutputEntry[];
}

export type ParametersDTO = {
  [key: string]: {
    [key: string]: any;
  };
};

export enum PanelsEnum {
  WORKFLOW = "WORKFLOW",
  CODE = "CODE",
  SYSTEM = "SYSTEM",
}

export type EditReferenceType = string;

export type ReferenceContext = {
  startSymbols?: string;
  endSymbols?: string;
};

export type ReferenceType = {
  printedValue: string;
  parsedValue: string;
  context?: ReferenceContext;
  parsedType: ParameterValueType;
};

export type ErrorType = string | null;

export type ParsedJson = Record<string, unknown> | Array<unknown> | string | number | boolean | null;
export type ReferencePreview = {
  type: "error" | "value";
  data: ParsedJson;
};

export type SuggestedItem = {
  original: string;
  matched: string;
  different: string;
};

export type CurrentParameter = { name: string; value: string };

export type ParameterValueType = "JOBS_EUI" | "PARAMETERS" | "NONE";
