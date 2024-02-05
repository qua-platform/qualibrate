export const GET_SCHEMA = (runtimeId?: number) => `runtime/${runtimeId || 1}/schema`;

export const PATCH_PARAMETERS = (runtimeId: number) => `runtime/${runtimeId || 1}/parameters`;

export const GET_AUTOCOMPLETE = "database/jobs/autocomplete/outputs";

export const RESOLVE_BY_EUI = "eui_api/resolve";

export const MY_CODE_SERVER = "codeserver/my";

export const CODE_SERVER_PING = "codeserver/ping";

export const CODE_SERVER_INIT = "cs_management/get";
