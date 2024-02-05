import { RequestStatus, StatusType } from "../types";

export const PENDING = "pending";
export const OK = "ok";
export const ERROR = "error";

export function formRequestStatus(data: { isOk: boolean; success?: string; error?: string }): RequestStatus {
  const { isOk, error, success } = data;
  return isOk ? { value: OK, message: success || undefined } : { value: ERROR, message: error || "Something went wrong" };
}

export function formShowMsgStatus(data: { isOk: boolean; success?: string; error?: string }): [string | undefined, StatusType] {
  const { isOk, error, success } = data;
  return isOk ? [success || undefined, OK] : [error || "Something went wrong", ERROR];
}

export function setPending(message?: string): RequestStatus {
  return { value: PENDING, message };
}

export function setOk(message?: string): RequestStatus {
  return { value: OK, message };
}

export function setError(message?: string): RequestStatus {
  return { value: ERROR, message };
}

export const isPending = (status?: RequestStatus): status is { value: "pending"; message?: string } => {
  return status?.value === PENDING;
};

export const isOk = (status?: RequestStatus): status is { value: "ok"; message?: string } => {
  return status?.value === OK;
};

export const isError = (status?: RequestStatus): status is { value: "error"; message?: string | { details: string } } => {
  return status?.value === ERROR;
};
