import { ADMIN_PANEL_URL, APP_URL, HOME_URL, LOGIN_URL } from "../DEPRECATED_common/modules";
import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import React, { useEffect } from "react";

import AdminPanelPage from "../DEPRECATED_pages/AdminPanelPage";
import LoaderPage from "../ui-lib/loader/LoaderPage";
import LoginPage from "../modules/auth/LoginPage";
import MainModularPage from "../DEPRECATED_pages/MainModularPage";
import WelcomePage from "../modules/WelcomePage/WelcomePage";
import { useAuthContext } from "../modules/auth/AuthContext";
import { useActiveProjectContext } from "../modules/ActiveProject/ActiveProjectContext";
import { useFlexLayoutContext } from "./flexLayout/FlexLayoutContext";

const AppRoutes = () => {
  const { isAuthorized, isVerifying } = useAuthContext();
  const { openTab } = useFlexLayoutContext();
  const { activeProject } = useActiveProjectContext();
  const navigate = useNavigate();

  // useEffect(() => {
  //   if (!isVerifying && !isAuthorized) {
  //     navigate(LOGIN_URL);
  //   }
  // }, [isAuthorized, isVerifying]);

  useEffect(() => {
    if (activeProject) {
      navigate(APP_URL);
      openTab("experiments");
    } else {
      navigate(HOME_URL);
    }
  }, [activeProject]);

  if (isVerifying) {
    return <LoaderPage />;
  }

  return (
    <>
      <Routes>
        <Route path={LOGIN_URL} element={<LoginPage />} />
        <Route path={ADMIN_PANEL_URL} element={<AdminPanelPage />} />
        <Route path={HOME_URL} element={<WelcomePage />} />
        <Route path={APP_URL} element={<MainModularPage />} />
        <Route path="*" element={<Navigate to={"/"} replace />} />
      </Routes>
    </>
  );
};

export default AppRoutes;
