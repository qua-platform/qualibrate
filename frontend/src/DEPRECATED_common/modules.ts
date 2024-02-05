export const APP_URL = "/app/";
export const HOME_URL = "/";
export const LOGIN_URL = "/login";
export const ADMIN_PANEL_URL = "/admin/";

export const APP_HOST = process.env.API_URL || window.location.origin + "/";
export const NOTEBOOK_URL = APP_HOST + "notebook/";
export const DASHBOARD_URL = APP_HOST + "dashboard/";

export const CODE_URL = (userId: string | number) => {
  return `${APP_HOST}codeserver/${userId}/?workspace=%2Fconfig%2Fdata%2FUser%2FWorkspaces%2Fruntime_1.code-workspace`;
};
export const DOCS_MODULE_URL = process.env.DOCS_URL ?? APP_HOST + "docs/entropyhub_flame/";
export const DOCS_GETTING_STARTED_MODULE_URL =
  process.env.DOCS_GETTING_STARTED_MODULE_URL ?? APP_HOST + "docs/entropyhub_flame/getting_started/#running-an-example";

export const H5_URL = APP_HOST + "data-explorer";

export const EXPERIMENT_SYSTEM_URL = (jobEui?: string | null) => APP_HOST + "data/quam" + (jobEui ? `?eui=${jobEui}` : "");
export const JOB_OUTPUT_URL = (jobEui?: string | null, nodeName?: string | null, outputName?: string | null) =>
  APP_HOST +
  "data/" +
  ((jobEui ? `?eui=${encodeURIComponent(jobEui)}` : "") +
    (nodeName ? `${encodeURIComponent("/" + nodeName)}` : "") +
    (outputName ? `${encodeURIComponent("/" + outputName)}` : ""));

export const PLOTLY_DASH_URL = (jobEui: string) => APP_HOST + "data/timeline" + (jobEui ? `?eui=${encodeURIComponent(jobEui)}` : "");
export const DATA_VIEW_DASH_URL = (selectedJobEUI: string) =>
  APP_HOST + "data/" + (selectedJobEUI ? `?eui=${encodeURIComponent(selectedJobEUI)}` : "");
