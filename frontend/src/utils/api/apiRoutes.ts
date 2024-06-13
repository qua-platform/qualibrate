export const ALL_SNAPSHOTS = ({ branchName = "main", pageNumber = 1, pageLimit = 100, reverseOrder = true, globalReverse = false }) =>
  "api/branch/" +
  branchName +
  "/snapshots_history?page=" +
  pageNumber +
  "&per_page=" +
  pageLimit +
  "&reverse=" +
  reverseOrder +
  "&global_reverse=" +
  globalReverse;
export const ONE_SNAPSHOT = (snapshotId: string) => `api/snapshot/${snapshotId}/`;
export const SNAPSHOT_RESULT = (snapshotId: string) => `api/data_file/${snapshotId}/content`;
export const SNAPSHOT_DIFF = (currentSnapshotId: string, newSnapshotId: string) =>
  `api/snapshot/${currentSnapshotId}/compare?id_to_compare=${newSnapshotId}`;
export const ALL_PROJECTS = () => "api/projects/list";
export const ACTIVE_PROJECT = () => "api/projects/active";
export const IS_NODE_RUNNING = () => `execution/is_running`;
export const ALL_NODES = () => "execution/get_nodes";
export const GET_NODE = (nodeName: string) => `execution/get_node?name=${nodeName}/`;
export const SUBMIT_NODE_RUN = () => `execution/submit`;
export const GET_LAST_RUN = () => "execution/last_run/";
