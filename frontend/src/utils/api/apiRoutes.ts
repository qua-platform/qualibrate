export const LOGIN = "auth/login";
export const LOGOUT = "auth/logout";
export const AUTH_VERIFY = "auth/verify";
export const AUTH_INFO = "auth/user_info";
export const ALL_SNAPSHOTS = "snapshot/all?db_name=json_db";
export const ONE_SNAPSHOT = (snapshotId: string) => `snapshot/${snapshotId}/?db_name=json_db`;
