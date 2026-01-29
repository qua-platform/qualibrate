import { RootDispatch, RootState } from "..";
import { SnapshotsSlice } from "./SnapshotsStore";
import {
  getAllSnapshots,
  getBreadCrumbs,
  getSecondId,
  getSelectedSnapshot,
  getSelectedSnapshotId,
  getSelectedSnapshotNode,
  getSelectedWorkflowForGraph,
  getTrackLatestSidePanel,
  getTrackPreviousSnapshot,
} from "./selectors";
import { fetchAllSnapshots, fetchAllTags, fetchSnapshotDiff, fetchSnapshotJsonData, fetchSnapshotResults } from "./utils";
import { MOCK_EXECUTION_HISTORY_ELEMENTS } from "../../../tests/unit/utils/mocks/execution_history";
import { SnapshotDTO, SnapshotSearchType } from "./api/SnapshotsApi";
import { handleRunNode } from "../NodesStore";
import { setSelectedWorkflowName, submitWorkflow } from "../GraphStores/GraphLibrary";
import { NodeDTO } from "../../modules/Nodes";

export const {
  setTrackLatestSidePanel,
  setTrackPreviousSnapshot,
  setPageNumber,
  setTotalPages,
  setAllSnapshots,
  setSelectedWorkflow,
  setSelectedNodeInWorkflowName,
  setSubgraphForward,
  setSubgraphBack,
  setAllTags,
  setSelectedSnapshotId,
  setSelectedSnapshot,
  setLatestSnapshotId,
  setClickedForSnapshotSelection,
  setJsonData,
  setJsonDataSidePanel,
  setDiffData,
  clearData,
  setResult,
  setFirstId,
  setSecondId,
  setReset,
} = SnapshotsSlice.actions;

export const fetchOneSnapshot =
  (snapshotId: number, snapshotId2?: number, updateResult = true, fetchUpdate = false) =>
  async (dispatch: RootDispatch, getState: () => RootState) => {
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

export const fetchGitgraphSnapshots =
  (firstTime: boolean, page: number, sortType?: SnapshotSearchType, searchString?: string, minDate?: string, maxDate?: string) =>
  async (dispatch: RootDispatch, getState: () => RootState) => {
    const trackLatestSidePanel = getTrackLatestSidePanel(getState());
    const trackPreviousSnapshot = getTrackPreviousSnapshot(getState());
    const secondId = getSecondId(getState());
    const selectedSnapshotId = getSelectedSnapshotId(getState());

    const resAllSnapshots = await fetchAllSnapshots(page, sortType, searchString, minDate, maxDate);
    dispatch(setAllSnapshots([]));
    if (resAllSnapshots && resAllSnapshots?.isOk) {
      const items = resAllSnapshots.result?.items;
      dispatch(setTotalPages(resAllSnapshots.result?.total_pages ?? 1));
      dispatch(setPageNumber(resAllSnapshots.result?.page ?? 1));
      dispatch(setAllSnapshots(resAllSnapshots.result?.items ?? []));
      // Uncomment this line to use MOCKS for Execution History page
      dispatch(setAllSnapshots(MOCK_EXECUTION_HISTORY_ELEMENTS.items));
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
          // dispatch(setSelectedSnapshot(items.find((snapshot) => snapshot.id === lastElId)));
          dispatch(fetchOneSnapshot(lastElId, lastElId - 1, true, true));
        } else {
          if (selectedSnapshotId) {
            dispatch(fetchOneSnapshot(selectedSnapshotId));
            dispatch(setReset(false));
          }
        }
      }
    }
  };

export const fetchSnapshotTags = () => async (dispatch: RootDispatch, getState: () => RootState) => {
  const resAllSnapshotTags = await fetchAllTags();
  if (resAllSnapshotTags && resAllSnapshotTags?.isOk) {
    dispatch(setAllTags(resAllSnapshotTags));
  }
  // TODO Uncomment this code to use mocked data
  dispatch(
    setAllTags([
      "resonance",
      "characterization",
      "calibration",
      "rabi",
      "relaxation",
      "error",
      "tomography",
      "validation",
      "benchmarking",
      "multi-qubit",
      "quick-check",
    ])
  );
};

// -----------------------------------------------------------
// PERIODICAL FETCH ALL SNAPSHOTS
export const intervalFetch = (page: number) => async (dispatch: RootDispatch, getState: () => RootState) => {
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

export const setSelectedSnapshotInSnapshotList = (snapshotName: string) => async (dispatch: RootDispatch, getState: () => RootState) => {
  const state = getState();
  if (state.snapshots.selectedWorkflow && state.snapshots.selectedWorkflow.items) {
    const snapshot = state.snapshots.selectedWorkflow?.items?.find((s) => s.metadata?.name === snapshotName);
    if (snapshot) {
      dispatch(setSelectedSnapshot(snapshot));
      dispatch(setSelectedSnapshotId(snapshot?.id));
      dispatch(fetchOneSnapshot(snapshot?.id));
    }
  }
};

export const setSelectedWorkflowFromBreadcrumbs = () => (dispatch: RootDispatch, getState: () => RootState) => {
  const state = getState();
  const selectedWorkflow = getSelectedWorkflowForGraph(state);

  if (!selectedWorkflow) {
    return;
  }
  dispatch(setSelectedWorkflow(selectedWorkflow));
  dispatch(setSelectedSnapshot(selectedWorkflow));
};

export const goBackOneLevel = () => (dispatch: RootDispatch, getState: () => RootState) => {
  const stateBeforeGoingBack = getState();

  const breadcrumbs = getBreadCrumbs(stateBeforeGoingBack);
  dispatch(setSubgraphBack(breadcrumbs.length - 1));
  const stateAfterBack = getState();
  const selectedWorkflow = getSelectedWorkflowForGraph(stateAfterBack);
  const allSnapshots = getAllSnapshots(stateAfterBack);
  const breadcrumbsAfterGoingBack = getBreadCrumbs(stateAfterBack);

  if (breadcrumbsAfterGoingBack.length === 0 && allSnapshots?.length > 0) {
    dispatch(setSelectedWorkflow(undefined));
    dispatch(setSelectedSnapshotId(allSnapshots[0].id));
    dispatch(fetchOneSnapshot(allSnapshots[0].id));
    dispatch(setSelectedSnapshot(allSnapshots[0]));
    dispatch(setSelectedNodeInWorkflowName(allSnapshots[0].metadata.name));
  } else {
    dispatch(setSelectedWorkflow(selectedWorkflow)); // hack for top navigation to refresh the redux
    dispatch(setSelectedSnapshotId(selectedWorkflow?.id));
    dispatch(setSelectedSnapshot(selectedWorkflow));
    dispatch(setSelectedNodeInWorkflowName(selectedWorkflow?.metadata?.name));
  }
};

const updateSnapshotsRecursive = (snapshots: SnapshotDTO[], targetName: string, selectedTags: string[]): SnapshotDTO[] => {
  return snapshots.reduce<SnapshotDTO[]>((acc, snapshot) => {
    if (snapshot.metadata?.name === targetName) {
      acc.push({
        ...snapshot,
        tags: selectedTags,
      });
    } else {
      acc.push({
        ...snapshot,
        items: snapshot.items ? updateSnapshotsRecursive(snapshot.items, targetName, selectedTags) : snapshot.items,
      });
    }

    return acc;
  }, []);
};

export const updateSnapshotTags = (selectedTags: string[]) => (dispatch: RootDispatch, getState: () => RootState) => {
  const state = getState();
  const allSnapshots = getAllSnapshots(state);
  const breadcrumbs = getBreadCrumbs(state);
  const selectedSnapshot = getSelectedSnapshot(state);

  if (breadcrumbs.length === 0) {
    const updatedSnapshots = allSnapshots.reduce<SnapshotDTO[]>((acc, snapshot) => {
      if (snapshot.metadata?.name === selectedSnapshot?.metadata?.name) {
        // update snapshots tags
        acc.push({ ...snapshot, tags: selectedTags });
      } else {
        acc.push(snapshot);
      }
      return acc;
    }, []);
    dispatch(setAllSnapshots(updatedSnapshots));
  } else if (selectedSnapshot) {
    const updatedSnapshots = updateSnapshotsRecursive(allSnapshots, selectedSnapshot?.metadata?.name, selectedTags);
    dispatch(setAllSnapshots(updatedSnapshots));
  }
};

export const runNodeOfSelectedSnapshot = () => (dispatch: RootDispatch, getState: () => RootState) => {
  const state = getState();
  const selectedSnapshot = getSelectedSnapshot(state);
  if (selectedSnapshot) {
    const nodeOfSnapshot = getSelectedSnapshotNode(state);
    if (nodeOfSnapshot) {
      dispatch(handleRunNode(nodeOfSnapshot as NodeDTO));
    }
  }
};

export const runWorkflowOfSelectedSnapshot = () => (dispatch: RootDispatch, getState: () => RootState) => {
  const state = getState();
  const selectedSnapshot = getSelectedSnapshot(state);
  if (selectedSnapshot) {
    dispatch(setSelectedWorkflowName(selectedSnapshot.metadata?.name));
    dispatch(submitWorkflow());
  }
};
