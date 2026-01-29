import { SnapshotComment, SnapshotsApi, SnapshotSearchType } from "./api/SnapshotsApi";

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

export const fetchAllSnapshots = (
  page: number,
  sortType: SnapshotSearchType = "name",
  searchString?: string,
  minDate?: string,
  maxDate?: string
) => {
  try {
    return SnapshotsApi.fetchAllSnapshots(page, sortType, searchString, minDate, maxDate);
  } catch (e) {
    console.error(`Failed to fetch all snapshots (page=${page}):`, e);
    return null;
  }
};

export const fetchAllTags = () => {
  try {
    return SnapshotsApi.fetchAllTags();
  } catch (e) {
    console.error("Failed to fetch all snapshot tags:", e);
    return null;
  }
};

export const addTagsToSnapshot = (snapshotId: number, selectedTags: string[]) => {
  try {
    return SnapshotsApi.addTagsToSnapshot(snapshotId.toString(), selectedTags);
  } catch (e) {
    console.error("Failed to add/remove snapshot tags:", e);
    return null;
  }
};

export const addCommentToSnapshot = (snapshotId: number, commentText: string) => {
  try {
    return SnapshotsApi.addCommentToSnapshot(snapshotId.toString(), commentText);
  } catch (e) {
    console.error(`Failed to add new comment to snapshotId=:${snapshotId}`, e);
    return undefined;
  }
};

export const updateSnapshotComment = (snapshotId: number, comment: SnapshotComment) => {
  try {
    return SnapshotsApi.updateSnapshotComment(snapshotId.toString(), comment);
  } catch (e) {
    console.error(`Failed to update comment with commentId=${comment.id} for snapshotId=:${snapshotId}`, e);
    return null;
  }
};

export const fetchAllCommentsForSnapshot = (snapshotId: number) => {
  try {
    return SnapshotsApi.fetchAllCommentsForSnapshot(snapshotId.toString());
  } catch (e) {
    console.error(`Failed to fetch comments for snapshotId=:${snapshotId}`, e);
    return null;
  }
};

export const removeCommentFromSnapshot = (snapshotId: number, commentId: number) => {
  try {
    return SnapshotsApi.removeCommentFromSnapshot(snapshotId.toString(), commentId.toString());
  } catch (e) {
    console.error(`Failed to remove comment with commentId=${commentId} for snapshotId=:${snapshotId}`, e);
    return null;
  }
};
