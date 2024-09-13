import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { HOME_URL, LOGIN_URL } from "../common/modules";
import MainModularPage from "../mainPage/MainModularPage";
import { Login } from "../modules/Login";

const AppRoutes = () => {
  return (
    <>
      <Routes>
        <Route path={LOGIN_URL} element={<Login />} />
        <Route path={HOME_URL} element={<MainModularPage />} />
        <Route path="*" element={<Navigate to={"/"} replace />} />
      </Routes>
    </>
  );
};

export default AppRoutes;
