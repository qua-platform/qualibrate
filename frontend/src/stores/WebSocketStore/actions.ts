import { RootDispatch, RootState } from "..";
import { fetchShouldRedirectUserToProjectPage } from "../ProjectStore/actions";
import { getConnectionLostAt, getShowConnectionErrorDialog } from "./selectors";
import { webSocketSlice } from "./WebSocketStore";

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
}

export const handleHideConnectionErrorDialog = () => (dispatch: RootDispatch, getState: () => RootState) => {
  const showConnectionErrorDialog = getShowConnectionErrorDialog(getState());
  if (!showConnectionErrorDialog) return

  localStorage.setItem("backandWorking", "true");
  dispatch(setConnectionLostAt(null));
  dispatch(setConnectionLostSeconds(0));
  dispatch(fetchShouldRedirectUserToProjectPage());
  dispatch(setShowConnectionErrorDialog(false));
}
