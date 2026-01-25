import { SnapshotsApi } from "./api/SnapshotsApi";

export const fetchSnapshotJsonData = (id: string) => {
  try {
    return SnapshotsApi.fetchSnapshot(id);
  } catch (e) {
    console.error(`Failed to fetch a snapshot (id=${id}):`, e);
    return null;
  }
};

export const fetchSnapshotResults = (id: string) => {
  try {
    return SnapshotsApi.fetchSnapshotResult(id);
  } catch (e) {
    console.error(`Failed to fetch results for the snapshot (id=${id}):`, e);
    return undefined;
  }
};

export const fetchSnapshotDiff = (id2: string, id1: string) => {
  try {
    return SnapshotsApi.fetchSnapshotUpdate(id1, id2);
  } catch (e) {
    console.error(`Failed to fetch snapshot updates for the snapshots (id2=${id2}, id1=${id1}):`, e);
    return undefined;
  }
};

export const fetchAllSnapshots = (page: number) => {
  try {
    return SnapshotsApi.fetchAllSnapshots(page);
  } catch (e) {
    console.error(`Failed to fetch all snapshots (page=${page}):`, e);
    return null;
  }
};
