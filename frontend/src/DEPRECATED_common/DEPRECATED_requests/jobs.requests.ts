import { API_METHODS } from "../DEPRECATED_enum/Api";
import { RequestEntry } from "../../utils/api/types";

// export const GET_ALL_JOBS = "database/jobs/all";
export const GET_ALL_JOBS_FILTER = "database/jobs/filter";
export const GET_JOB_BY_ID = (id: number | string) => `database/jobs/${id}`;
export const GET_JOB_BY_EUI_FILTER = "database/search/outputs";
export const GET_JOBS_BY_WORKFLOW_ID = (id: number) => `database/workflow/${id}/jobs`;
export const RUN_JOB = (runtimeId: number) => `runtime/${runtimeId || 1}/jobs/schedule_run`;
export const GET_JOB_STATUS_BY_ID = (id: number) => `database/jobs/${id}/status`;

export const GET_JOB_PARAMETERS = (jobId: number) => `database/jobs/${jobId}/diagrams`;

export const GROUP_JOBS_BY_DATE = "database/jobs/group/date";
export const DIFF_JOBS_BY_EUI = "git/diff";

export const jobPaths = {
  TERMINATE_JOB: (jobId: number, runtimeId: number): RequestEntry => [`runtime/${runtimeId || 1}/jobs/${jobId}/revoke`, API_METHODS.POST],
  RERUN_JOB: (jobId: number, runtimeId: number): RequestEntry => [`runtime/${runtimeId}/jobs/${jobId}/rerun`, API_METHODS.POST],
};
