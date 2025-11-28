import { RootDispatch, RootState } from "..";
import { setLastRunInfo } from "../GraphStores/GraphLibrary/actions";
import { getLastRunInfo } from "../GraphStores/GraphLibrary/selectors";
import { fetchShouldRedirectUserToProjectPage } from "../ProjectStore/actions";
import { getConnectionLostAt, getShowConnectionErrorDialog } from "./selectors";
import { RunStatusType, webSocketSlice } from "./WebSocketStore";

export const {
  setRunStatus,
  setHistory,
  setShowConnectionErrorDialog,
  setConnectionLostAt,
  setConnectionLostSeconds,
} = webSocketSlice.actions;

export const handleShowConnectionErrorDialog = () => (dispatch: RootDispatch, getState: () => RootState) => {
  const connectionLostAt = getConnectionLostAt(getState());

  if (localStorage.getItem("backandWorking") !== "true") {
    return;
  }

  if (connectionLostAt === null) {
    const now = Date.now();
    dispatch(setConnectionLostAt(now));
    dispatch(setConnectionLostSeconds(0));
  }

  dispatch(setShowConnectionErrorDialog(true));
  localStorage.setItem("backandWorking", "false");
};

export const handleHideConnectionErrorDialog = () => (dispatch: RootDispatch, getState: () => RootState) => {
  const showConnectionErrorDialog = getShowConnectionErrorDialog(getState());
  if (!showConnectionErrorDialog) return;

  localStorage.setItem("backandWorking", "true");
  dispatch(setConnectionLostAt(null));
  dispatch(setConnectionLostSeconds(0));
  dispatch(fetchShouldRedirectUserToProjectPage());
  dispatch(setShowConnectionErrorDialog(false));
};

export const handleSetRunStatus = (runStatus: RunStatusType) =>
  (dispatch: RootDispatch, getState: () => RootState) => {
    const lastRunInfo = getLastRunInfo(getState());

    dispatch(setRunStatus(runStatus));
    dispatch(setLastRunInfo({
      ...lastRunInfo,
      active: runStatus.is_running,
      workflowName: runStatus.graph?.name,
      activeNodeName: runStatus.node?.name ?? "",
      nodesCompleted: runStatus.graph?.finished_nodes,
      nodesTotal: runStatus.graph?.total_nodes,
      runDuration: runStatus.graph?.run_duration,
      error: runStatus.graph?.run_results?.error || undefined,
    }));
  };
