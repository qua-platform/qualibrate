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
