import { RootDispatch, RootState } from "..";
import { SnapshotsSlice } from "./SnapshotsStore";
import { getAllSnapshots, getSecondId, getSelectedSnapshotId, getTrackLatestSidePanel, getTrackPreviousSnapshot } from "./selectors";
import { fetchAllSnapshots, fetchSnapshotDiff, fetchSnapshotJsonData, fetchSnapshotResults } from "./utils";

export const {
  setTrackLatestSidePanel,
  setTrackPreviousSnapshot,
  setPageNumber,
  setTotalPages,
  setAllSnapshots,
  setSelectedSnapshotId,
  setLatestSnapshotId,
  setClickedForSnapshotSelection,
  setJsonData,
  setJsonDataSidePanel,
  setDiffData,
  setResult,
  setFirstId,
  setSecondId,
  setReset,
} = SnapshotsSlice.actions;

export const fetchOneSnapshot = (snapshotId: number, snapshotId2?: number, updateResult = true, fetchUpdate = false) =>
  async (dispatch: RootDispatch) => {
    const id1 = (snapshotId ?? 0).toString();
    const id2 = snapshotId2 ? snapshotId2.toString() : snapshotId - 1 >= 0 ? (snapshotId - 1).toString() : "0";
    const resSnapshotJsonData = await fetchSnapshotJsonData(id1);
    if (resSnapshotJsonData?.isOk) {
      if (updateResult) {
        dispatch(setJsonData(resSnapshotJsonData.result?.data));
        const resSnapshotResults = await fetchSnapshotResults(id1);
        if (resSnapshotResults?.isOk) {
          dispatch(setResult(resSnapshotResults?.result));
        }
      }
      dispatch(setJsonDataSidePanel(resSnapshotJsonData?.result?.data?.quam ?? {}));
    }
    if (id1 !== id2 && fetchUpdate) {
      const resSnapshotDiff = await fetchSnapshotDiff(id2, id1);
      if (resSnapshotDiff?.isOk) {
        dispatch(setDiffData(resSnapshotDiff?.result ?? {}));
      }
    } else {
      dispatch(setDiffData({}));
    }
  };

export const fetchGitgraphSnapshots = (firstTime: boolean, page: number) =>
  async (dispatch: RootDispatch, getState: () => RootState) => {
    const trackLatestSidePanel = getTrackLatestSidePanel(getState());
    const trackPreviousSnapshot = getTrackPreviousSnapshot(getState());
    const secondId = getSecondId(getState());
    const selectedSnapshotId = getSelectedSnapshotId(getState());

    const resAllSnapshots = await fetchAllSnapshots(page);
    dispatch(setAllSnapshots([]));
    if (resAllSnapshots && resAllSnapshots?.isOk) {
      const items = resAllSnapshots.result?.items;
      dispatch(setTotalPages(resAllSnapshots.result?.total_pages ?? 1));
      dispatch(setPageNumber(resAllSnapshots.result?.page ?? 1));
      dispatch(setAllSnapshots(resAllSnapshots.result?.items ?? []));
      let lastElId = 0;
      if (items) {
        lastElId = items.length > 0 ? items[0]?.id : 0;
        dispatch(setLatestSnapshotId(lastElId));
        if (trackLatestSidePanel) {
          const snapshotId1 = lastElId;
          const snapshotId2 = trackPreviousSnapshot ? lastElId - 1 : Number(secondId);
          fetchOneSnapshot(snapshotId1, snapshotId2, false, true);
        }
      }
      if (firstTime) {
        if (items) {
          dispatch(setSelectedSnapshotId(lastElId));
          fetchOneSnapshot(lastElId, lastElId - 1, true, true);
        } else {
          if (selectedSnapshotId) {
            fetchOneSnapshot(selectedSnapshotId);
            dispatch(setReset(false));
          }
        }
      }
    }
  }

// -----------------------------------------------------------
// PERIODICAL FETCH ALL SNAPSHOTS
export const intervalFetch = (page: number) =>
  async (dispatch: RootDispatch, getState: () => RootState) => {
    const allSnapshots = getAllSnapshots(getState());
    const resAllSnapshots = await fetchAllSnapshots(page);
    if (resAllSnapshots) {
      dispatch(setTotalPages(resAllSnapshots.result?.total_pages as number));
      dispatch(setPageNumber(resAllSnapshots.result?.page as number));
      const newMaxId = resAllSnapshots.result?.items[0]?.id;
      const odlMaxId = allSnapshots ? allSnapshots[0]?.id : 0;
      console.log(`Max snapshot ID - previous=${odlMaxId}, latest=${newMaxId}`);
      if (newMaxId !== odlMaxId! && resAllSnapshots.result?.items?.length !== 0) {
        dispatch(setReset(true));
      } else {
        dispatch(setReset(false));
      }
    }
  };
