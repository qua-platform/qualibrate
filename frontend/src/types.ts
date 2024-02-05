export type MinifyProp = { minify?: boolean };

export type StatusType = "pending" | "ok" | "error";

export type RequestStatus = { value: StatusType; message?: string | { details: string } };
