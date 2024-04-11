export const LOGIN = "auth/login";
export const LOGOUT = "auth/logout";
export const AUTH_VERIFY = "auth/verify";
export const AUTH_INFO = "auth/user_info";
export const ALL_SNAPSHOTS = (branchName: string = "main", reverseOrder = true, num_snapshots = 200) =>
  "api/branch/" + branchName + "/snapshots_history?reverse=" + reverseOrder + "&num=" + num_snapshots;
export const ONE_SNAPSHOT = (snapshotId: string) => `api/snapshot/${snapshotId}/`;
export const SNAPSHOT_RESULT = (snapshotId: string) => `api/data_file/${snapshotId}/content`;
export const SNAPSHOT_DIFF = (currentSnapshotId: string, newSnapshotId: string) =>
  `api/snapshot/${currentSnapshotId}/compare?id_to_compare=${newSnapshotId}`;
