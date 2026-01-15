import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { HOME_URL, LOGIN_URL } from "../../utils/api/apiRoutes";
import MainPage from "./components/MainPage/MainPage";
import { Login } from "../Login";
import { LoaderPage } from "../../components";
import { useSelector } from "react-redux";
import { getIsAuthorized, getIsTriedLoginWithEmptyString } from "../../stores/AuthStore";
import { useLogin } from "../../stores/AuthStore";
import { useInitNodes } from "../../stores/NodesStore";
import { useInitProjects } from "../../stores/ProjectStore";
import { useInitGraphs } from "../../stores/GraphStores";
import { useInitWebSocket } from "../../stores/WebSocketStore";
import { useInitSnapshots } from "../../stores/SnapshotsStore";

export const useInitApp = () => {
  useLogin();
  useInitNodes();
  useInitProjects();
  useInitGraphs();
  useInitWebSocket();
  useInitSnapshots();
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
