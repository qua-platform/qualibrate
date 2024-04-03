export const APP_URL = "/app/";
export const HOME_URL = "/";

export const APP_HOST = process.env.API_URL || window.location.origin + "/";
export const DOCS_MODULE_URL = process.env.DOCS_URL ?? APP_HOST + "docs/entropyhub_flame/";
export const DOCS_GETTING_STARTED_MODULE_URL =
  process.env.DOCS_GETTING_STARTED_MODULE_URL ?? APP_HOST + "docs/entropyhub_flame/getting_started/#running-an-example";

export const DATA_VIEW_DASH_URL = (selectedJobEUI: string) =>
  APP_HOST + "data/" + (selectedJobEUI ? `?eui=${encodeURIComponent(selectedJobEUI)}` : "");
