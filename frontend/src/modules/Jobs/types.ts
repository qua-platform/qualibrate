import { JobStatuses } from "../../DEPRECATED_common/DEPRECATED_enum/JobStatuses";

export type SortOrder = "ascending" | "descending";

export type JobListOptions = {
  filterType?: string;
  date_order?: SortOrder;
  order?: SortOrder;
  start_date?: string;
  end_date?: string;
  submit_min_date?: string;
  submit_max_date?: string;
  group_by?: "submit" | "start" | "end" | "date";
  search_request?: string;
  search_path?: string;
  statuses?: JobStatuses[];
  user_id?: number;
  use_workflow_in_search?: boolean;
  skip?: number;
  limit?: number;
  project_id?: number;
  page_number?: number;
  username?: string;
};

export type EUI = string;

export type DiffType = string;

export type JobDiffType = {
  parameters: DiffType;
  workflow: DiffType;
};

export type JobStatusDetails = {
  nodes: Array<{ [key: string]: string }>;
  status: JobStatuses;
  stderr: string;
  nodes_count: number;
  nodes_error: number;
  nodes_success: number;
  status_message: string;
};
export type IJobStatus = {
  id: number;
  current_status: JobStatuses;
  job_statuses: Array<{
    job_id: number;
    job_status: string;
    timestamp: string;
    details?: JobStatusDetails;
  }>;
};

export type IJobParameters = {
  parameters: object;
  workflow: object;
};

export enum JobAction {
  RERUN = "rerun",
  CANCEL = "cancel",
}

export type JobsFilter = {
  filterType?: "By name" | "By EUI";
  search_request?: string;
  start_date?: Date;
  end_date?: Date;
  statuses?: JobStatuses[];
  successful?: boolean;
  user_id?: number;
  username?: string;
  use_workflow_in_search?: boolean;
  date_order?: "ascending" | "descending";
  skip?: number;
  limit?: number;
};
