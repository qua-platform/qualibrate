import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { HOME_URL, LOGIN_URL } from "../common/modules";
import MainPage from "./MainPage/MainPage";
import { Login } from "../modules/Login";
import { useAuthContext } from "../modules/Login/context/AuthContext";
import LoaderPage from "../ui-lib/loader/LoaderPage";

const ProtectedRoute = ({ children }: { children: React.JSX.Element }): React.JSX.Element => {
  const { isAuthorized, triedLoginWithEmptyString } = useAuthContext();

  if (!isAuthorized) {
    if (!triedLoginWithEmptyString) {
      return <LoaderPage />;
    }
    return <Navigate to={LOGIN_URL} replace />;
  }
  return children;
};

const AppRoutes = () => {
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
