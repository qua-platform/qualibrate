import React, { useEffect } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { HOME_URL, LOGIN_URL } from "../common/modules";
import MainPage from "./MainPage/MainPage";
import { Login } from "../modules/Login";
import LoaderPage from "../ui-lib/loader/LoaderPage";
import { useSelector } from "react-redux";
import { getIsAuthorized, getIsTriedLoginWithEmptyString } from "../stores/AuthStore/selectors";
import { useLogin } from "../stores/AuthStore/hooks";
import { useInitNodes } from "../stores/NodesStore/hooks";
import { initProjects } from "../stores/ProjectStore/hooks";
import { initGraphs } from "../stores/GraphStores/hooks";

export const useInitApp = () => {
  useLogin();
  useInitNodes();
  initProjects();
  initGraphs();
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
