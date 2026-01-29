import { RootDispatch, RootState } from "../index";
import { SnapshotsSlice } from "./SnapshotsStore";
import { getPageNumber, getSecondId, getSelectedSnapshotId, getTrackLatestSidePanel, getTrackPreviousSnapshot } from "./selectors";
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
  clearData,
  setResult,
  setFirstId,
  setSecondId,
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

export const fetchGitgraphSnapshots = (firstTime: boolean) =>
  async (dispatch: RootDispatch, getState: () => RootState) => {
    const trackLatestSidePanel = getTrackLatestSidePanel(getState());
    const trackPreviousSnapshot = getTrackPreviousSnapshot(getState());
    const secondId = getSecondId(getState());
    const selectedSnapshotId = getSelectedSnapshotId(getState());
    const page = getPageNumber(getState());

    const resAllSnapshots = await fetchAllSnapshots(page);
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
          dispatch(fetchOneSnapshot(snapshotId1, snapshotId2, false, true));
        }
      }
      if (firstTime) {
        if (items) {
          dispatch(setSelectedSnapshotId(lastElId));
          dispatch(fetchOneSnapshot(lastElId, lastElId - 1, true, true));
        } else {
          if (selectedSnapshotId) {
            dispatch(fetchOneSnapshot(selectedSnapshotId));
          }
        }
      }
    }
  };
