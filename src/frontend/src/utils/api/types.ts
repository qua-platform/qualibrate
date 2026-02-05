import { ErrorObject } from "../../components";
import { ErrorWithDetails } from "../../stores/NodesStore";

export type GETOptions = {
  [key: string]: unknown | string | URLSearchParams | string[][] | Record<string, string> | undefined;
};

export type FetchOptions = {
  queryParams?: GETOptions;
  body?: BodyInit | null | undefined;
  headers?: Record<string, string>; // set custom headers
};

export type RequestEntry = [path: string, method: API_METHODS];

export enum API_METHODS {
  GET = "GET",
  POST = "POST",
}

export type Res<P = Record<string, never>> = {
  isOk: boolean;
  error?: string | { detail: string } | ErrorWithDetails | ErrorObject;
  result?: P;
};
