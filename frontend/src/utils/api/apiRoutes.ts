export const LOGIN = "auth/login";
export const LOGOUT = "auth/logout";
export const AUTH_VERIFY = "auth/verify";
export const AUTH_INFO = "auth/user_info";
export const ALL_SNAPSHOTS = (branchName: string = "main", reverseOrder = true, num_snapshots = 200) =>
    "api/json_db/branch/" + branchName + "/history?reverse=" + reverseOrder + "&num_snapshots=" + num_snapshots;
export const ONE_SNAPSHOT = (snapshotId: string) => `api/json_db/snapshot/${snapshotId}/`;
export const SNAPSHOT_RESULT = (snapshotId: string) => `api/json_db/storage/${snapshotId}/content`;
