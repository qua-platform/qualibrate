import * as FlexLayout from "flexlayout-react";
import "flexlayout-react/style/light.css";
import React, { useEffect } from "react";
import { flexClassNameMapper, flexLayoutFactory } from "../routing/flexLayout/FlexLayoutFactory";
import MainLayout from "../ui-lib/layouts/MainLayout";
import { useFlexLayoutContext } from "../routing/flexLayout/FlexLayoutContext";
import { useAuthContext } from "../modules/Login/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { LOGIN_URL } from "../common/modules";
import { useProjectContext } from "../modules/Project/context/ProjectContext";
import { NODES_KEY, PROJECT_KEY } from "../routing/ModulesRegistry";

const MainModularPage = () => {
  const { isAuthorized } = useAuthContext();
  const { model, checkIsEmpty, flexLayoutListener, openTab, setActiveTabsetName } = useFlexLayoutContext();
  const { activeProject } = useProjectContext();
  const navigate = useNavigate();

  useEffect(() => {
    const checkVersion = async () => {
      const localVersion = localStorage.getItem("appVersion");
      try {
        const response = await fetch("manifest.json");
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
    try {
      // @ts-expect-error: Small fix to force hard refresh in order to clear the cache
      window.location.reload(true); // Hard refresh to clear cache
    } catch (error) {
      console.error("Failed to do the hard refresh and clear the cache:", error);
    }
  };

  useEffect(() => {
    if (!isAuthorized) {
      navigate(LOGIN_URL);
    } else if (!activeProject) {
      openTab(PROJECT_KEY);
      setActiveTabsetName(PROJECT_KEY);
    } else {
      openTab(NODES_KEY);
      setActiveTabsetName(NODES_KEY);
    }
  }, [isAuthorized, activeProject]);

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
