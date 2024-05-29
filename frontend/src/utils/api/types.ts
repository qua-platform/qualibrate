import { API_METHODS } from "../../DEPRECATED_common/DEPRECATED_enum/Api";

export type GETOptions = {
  [key: string]: unknown | string | URLSearchParams | string[][] | Record<string, string> | undefined;
};

export type FetchOptions = {
  queryParams?: GETOptions;
  body?: BodyInit | null | undefined;
  headers?: Record<string, string>; // set custom headers
};

export type RequestEntry = [path: string, method: API_METHODS];
