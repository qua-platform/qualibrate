import {
  GET_ALL_JOBS_FILTER,
  GET_JOB_BY_EUI_FILTER,
  GET_JOB_BY_ID,
  GET_JOB_PARAMETERS,
  GET_JOB_STATUS_BY_ID,
  GET_JOBS_BY_WORKFLOW_ID,
  GROUP_JOBS_BY_DATE,
  jobPaths,
  RUN_JOB,
} from "../DEPRECATED_requests/jobs.requests";

import { API_METHODS } from "../DEPRECATED_enum/Api";
import Api from "../../utils/api";
import { EUI, JobDTO } from "../DEPRECATED_dtos/job.dto";
import { JobRunRequestDTO } from "../DEPRECATED_dtos/job.add.request.dto";
import { JobStatuses } from "../DEPRECATED_enum/JobStatuses";
import { JobTerminateRequestDTO } from "../DEPRECATED_dtos/job.terminate.request.dto";
import { PRes, Res } from "../DEPRECATED_interfaces/Api";
import { DTOResponse, WorkflowDTO } from "../../modules/Experiments/types";
import { IJobParameters, IJobStatus, JobListOptions } from "../../modules/Jobs/types";
import { DELETE_JOBS_BY_IDS } from "../../modules/Jobs/api/requests";
import { ProjectParams } from "../../utils/api/types";

const DEFAULT_PARAMETERS_FILE_NAME = "parameters.json";
export class JobApi extends Api {
  constructor() {
    super();
  }

  static getFilteredJobs(options?: JobListOptions): Promise<Res<DTOResponse>> {
    return this._fetch(this.api(GET_ALL_JOBS_FILTER), API_METHODS.GET, {
      queryParams: options,
    });
  }
  static getFilteredJobsByEUI(options?: JobListOptions): Promise<Res<DTOResponse>> {
    return this._fetch(this.api(GET_JOB_BY_EUI_FILTER), API_METHODS.GET, {
      queryParams: options,
    });
  }

  static getJobById(id: string): Promise<Res<JobDTO>> {
    return this._fetch(this.api(GET_JOB_BY_ID(id)), API_METHODS.GET);
  }

  static getJobsByWorkflowId(id: number): Promise<Res<WorkflowDTO>> {
    return this._fetch(this.api(GET_JOBS_BY_WORKFLOW_ID(id)), API_METHODS.GET);
  }

  static runJob(data: JobRunRequestDTO, runtimeId: number, project_id: number): Promise<Res<JobDTO>> {
    return this._fetch(this.api(RUN_JOB(runtimeId)), API_METHODS.POST, {
      body: JSON.stringify({ job_spec: data }),
      queryParams: { project_id },
    });
  }

  static getJobStatus(id: number): Promise<Res<IJobStatus>> {
    return this._fetch(this.api(GET_JOB_STATUS_BY_ID(id)), API_METHODS.GET);
  }

  static getJobParameters(jobId: number, jobEUI: EUI, parametersFile?: string): Promise<Res<IJobParameters>> {
    const queryParams = {
      jobEUI,
      parameters_file: parametersFile || DEFAULT_PARAMETERS_FILE_NAME,
    };
    return this._fetch(this.api(GET_JOB_PARAMETERS(jobId)), API_METHODS.GET, {
      queryParams,
    });
  }

  static terminateJobById({
    id,
    body,
    runtime_id,
    project_id,
  }: ProjectParams & {
    id: number;
    body: JobTerminateRequestDTO;
  }): PRes<JobStatuses> {
    return this.fetch(jobPaths.TERMINATE_JOB(id, runtime_id), {
      queryParams: {
        project_id,
        ...body,
      },
    });
  }

  static rerunJobById({
    id,
    runtime_id,
    project_id,
  }: ProjectParams & {
    id: number;
  }): PRes<JobStatuses> {
    return this.fetch(jobPaths.RERUN_JOB(id, runtime_id), {
      queryParams: {
        project_id,
      },
    });
  }
  static getJobDateRanges(date_order: "ascending" | "descending") {
    return this._fetch(this.api(GROUP_JOBS_BY_DATE), API_METHODS.GET, {
      queryParams: { date_order },
    });
  }

  static deleteJobsByIds(ids: number[]) {
    return this._fetch(this.api(DELETE_JOBS_BY_IDS), API_METHODS.POST, {
      body: JSON.stringify(ids),
    });
  }
}
