import * as FlexLayout from "flexlayout-react";
import "flexlayout-react/style/light.css";
import React, { useEffect } from "react";
import { flexClassNameMapper, flexLayoutFactory } from "../routing/flexLayout/FlexLayoutFactory";
import MainLayout from "../ui-lib/layouts/MainLayout";
import { useFlexLayoutContext } from "../routing/flexLayout/FlexLayoutContext";
import { useAuthContext } from "../modules/Login/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { LOGIN_URL } from "../common/modules";

const MainModularPage = () => {
  const { model, checkIsEmpty, flexLayoutListener, openTab } = useFlexLayoutContext();
  const { isAuthorized } = useAuthContext();
  const navigate = useNavigate();

  useEffect(() => {
    const checkVersion = async () => {
      const localVersion = localStorage.getItem("appVersion");
      try {
        const response = await fetch("/assets/manifest.json");
        const { version } = await response.json();

        if (localVersion && version !== localVersion) {
          handleRefresh();
        }

        // Update the local storage with the current version
        localStorage.setItem("appVersion", version);
      } catch (error) {
        console.error("Failed to fetch version:", error);
      }
    };

    checkVersion();
  }, []);

  const handleRefresh = () => {
    // @ts-ignore
    window.location.reload(true); // Hard refresh to clear cache
  };

  useEffect(() => {
    if (!isAuthorized) {
      navigate(LOGIN_URL);
    } else {
      openTab("nodes");
    }
  }, [isAuthorized]);

  useEffect(checkIsEmpty, []);
  return (
    <MainLayout>
      <FlexLayout.Layout
        factory={flexLayoutFactory}
        classNameMapper={flexClassNameMapper}
        onModelChange={checkIsEmpty}
        model={model}
        onAction={flexLayoutListener}
      />
    </MainLayout>
  );
};

export default MainModularPage;
