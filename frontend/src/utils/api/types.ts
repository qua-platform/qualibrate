import { API_METHODS } from "../../DEPRECATED_common/DEPRECATED_enum/Api";

export type GETOptions = { [key: string]: any };

export type FetchOptions = {
  queryParams?: GETOptions;
  body?: any;
  headers?: Record<string, string>; // set custom headers
};

export type RequestEntry = [path: string, method: API_METHODS];

export type ProjectParams = {
  project_id: number;
  runtime_id: number;
};
