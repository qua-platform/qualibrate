import React, { useEffect } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { HOME_URL, LOGIN_URL } from "../common/modules";
import MainPage from "./MainPage/MainPage";
import { Login } from "../modules/Login";
import LoaderPage from "../ui-lib/loader/LoaderPage";
import { useSelector } from "react-redux";
import { getIsAuthorized, getIsTriedLoginWithEmptyString } from "../stores/AuthStore/selectors";
import { useLogin } from "../stores/AuthStore/hooks";
import { useRootDispatch } from "../stores";
import { fetchProjectsAndActive, fetchShouldRedirectUserToProjectPage } from "../stores/ProjectStore/actions";
import { fetchAllCalibrationGraphs, fetchWorkflowGraph, setLastRunInfo, setSelectedWorkflow } from "../stores/GraphStores/GraphLibrary/actions";
import { getAllGraphs, getLastRunInfo, getSelectedWorkflowName } from "../stores/GraphStores/GraphLibrary/selectors";
import { useWebSocketData } from "../contexts/WebSocketContext";

export const useInitApp = () => {
  const dispatch = useRootDispatch();
  const selectedWorkflowName = useSelector(getSelectedWorkflowName)
  const allGraphs = useSelector(getAllGraphs);
  const lastRunInfo = useSelector(getLastRunInfo);
  const { runStatus } = useWebSocketData();

  useLogin();

  useEffect(() => {
    dispatch(fetchProjectsAndActive());
    dispatch(fetchShouldRedirectUserToProjectPage());
  }, []);

  useEffect(() => {
    if (selectedWorkflowName) {
      dispatch(fetchWorkflowGraph(selectedWorkflowName));
      dispatch(setSelectedWorkflow(allGraphs?.[selectedWorkflowName]));
    } else if (lastRunInfo?.workflowName) {
      dispatch(fetchWorkflowGraph(lastRunInfo?.workflowName));
    }
  }, [lastRunInfo, selectedWorkflowName]);

  useEffect(() => {
    if (runStatus && runStatus.graph && runStatus.node) {
      dispatch(setLastRunInfo({
        ...lastRunInfo,
        active: runStatus.is_running,
        workflowName: runStatus.graph.name,
        activeNodeName: runStatus.node.name ?? "",
        nodesCompleted: runStatus.graph.finished_nodes,
        nodesTotal: runStatus.graph.total_nodes,
        runDuration: runStatus.graph.run_duration,
        error: runStatus.graph.error,
      }));
    }
  }, [runStatus]);

  useEffect(() => {
    dispatch(fetchAllCalibrationGraphs());
  }, []);
};

const ProtectedRoute = ({ children }: { children: React.JSX.Element }): React.JSX.Element => {
  const isAuthorized = useSelector(getIsAuthorized);
  const triedLoginWithEmptyString = useSelector(getIsTriedLoginWithEmptyString);

  if (!isAuthorized) {
    if (!triedLoginWithEmptyString) {
      return <LoaderPage />;
    }
    return <Navigate to={LOGIN_URL} replace />;
  }
  return children;
};

const AppRoutes = () => {
  useInitApp();

  return (
    <>
      <Routes>
        <Route path={LOGIN_URL} element={<Login />} />
        <Route
          path={HOME_URL}
          element={
            <ProtectedRoute>
              <MainPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="*"
          element={
            <ProtectedRoute>
              <Navigate to={"/"} />
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
};

export default AppRoutes;
