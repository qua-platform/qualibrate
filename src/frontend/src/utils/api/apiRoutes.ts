export const HOME_URL = "/";
export const LOGIN_URL = "/login";
export const ALL_SNAPSHOTS = ({
  branchName = "main",
  pageNumber = 1,
  pageLimit = 100,
  descending = true,
  sortType = "name",
  searchString,
  minDate,
  maxDate,
}: {
  branchName?: string;
  pageNumber?: number;
  pageLimit?: number;
  descending?: boolean;
  sortType?: string;
  searchString?: string;
  minDate?: string;
  maxDate?: string;
}) => {
  const query = new URLSearchParams({
    page: pageNumber.toString(),
    per_page: pageLimit.toString(),
    descending: descending ? "true" : "false",
    sort: sortType,

    ...(searchString && { name_part: searchString }),
    ...(minDate && { min_date: minDate }),
    ...(maxDate && { max_date: maxDate }),
  });
  return `api/branch/${branchName}/snapshots_history?${query.toString()}`;
};
/***************************************** TAGS *****************************************/
export const CREATE_NEW_TAG = () => "api/snapshot/tag/create";
export const ALL_SNAPSHOT_TAGS = () => "api/snapshot/tags";
export const DELETE_TAG = () => "api/snapshot/tag/remove";
/********************************* SNAPSHOT TAGS *****************************************/
export const ADD_TAGS_TO_SNAPSHOT = (snapshotId: string) => `api/snapshot/${snapshotId}/tags`;
export const REMOVE_TAG_FROM_SNAPSHOT = (snapshotId: string) => `api/snapshot/${snapshotId}/tag/remove`;
export const ALL_TAGS_FOR_ONE_SNAPSHOT = (snapshotId: string) => `api/snapshot/${snapshotId}/tags`;
/***************************************** COMMENTS *****************************************/
export const ADD_COMMENT_TO_SNAPSHOT = (snapshotId: string) => `api/snapshot/${snapshotId}/comment/create`;
export const UPDATE_COMMENT_SNAPSHOT = (snapshotId: string) => `api/snapshot/${snapshotId}/comment/update`;
export const ALL_COMMENTS_FOR_ONE_SNAPSHOT = (snapshotId: string) => `api/snapshot/${snapshotId}/comments`;
export const REMOVE_COMMENT_FROM_SNAPSHOT = (snapshotId: string) => `api/snapshot/${snapshotId}/comment/remove`;
export const ONE_SNAPSHOT = (snapshotId: string) => `api/snapshot/${snapshotId}/`;
export const SNAPSHOT_RESULT = (snapshotId: string) => `api/data_file/${snapshotId}/content`;
export const SNAPSHOT_DIFF = (currentSnapshotId: string, newSnapshotId: string) =>
  `api/snapshot/${currentSnapshotId}/compare?id_to_compare=${newSnapshotId}`;
export const UPDATE_SNAPSHOT = (id: string) => `api/snapshot/${id}/update_entry`;
export const UPDATE_SNAPSHOTS = (id: string) => `api/snapshot/${id}/update_entries`;
export const ALL_PROJECTS = () => "api/projects/";
export const ACTIVE_PROJECT = () => "api/project/active";
export const SHOULD_REDIRECT_USER_TO_SPECIFIC_PAGE = () => "api/redirect";
export const CREATE_PROJECT = () => "api/project/create";
export const STOP_RUNNING = () => "execution/stop";
export const ALL_NODES = () => "execution/get_nodes";
export const ALL_GRAPHS = () => "execution/get_graphs";
export const GET_WORKFLOW_GRAPH = () => "execution/get_graph/cytoscape";
export const SUBMIT_NODE_RUN = () => "execution/submit/node";
export const SUBMIT_WORKFLOW_RUN = () => "execution/submit/workflow";
export const GET_EXECUTION_HISTORY = () => "execution/last_run/workflow/execution_history?reverse=true";
export const GET_LAST_RUN = () => "execution/last_run/";
export const GET_LAST_RUN_WORKFLOW_STATUS = () => "execution/last_run/workflow/status";
export const GET_LOGS = ({
  after,
  before,
  num_entries,
  reverse,
}: {
  after: string | null;
  before: string | null;
  num_entries: string;
  reverse: boolean;
}) => {
  const query = new URLSearchParams({
    ...(after && { after }),
    ...(before && { before }),
    num_entries: num_entries,
    reverse: reverse ? "true" : "false",
  });

  return `execution/output_logs?${query.toString()}`;
};
