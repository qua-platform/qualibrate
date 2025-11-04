import { useEffect } from "react";
import { useSelector } from "react-redux";
import MainLayout from "../MainLayout/MainLayout";
import { useMainPageContext } from "../MainPageContext";
import { useNavigate } from "react-router-dom";
import { LOGIN_URL } from "../../common/modules";
import { DATA_KEY, GRAPH_LIBRARY_KEY, GRAPH_STATUS_KEY, ModuleKey, NODES_KEY, PROJECT_KEY } from "../ModulesRegistry";
import Nodes from "../../modules/Nodes";
import CalibrationGraph from "../../modules/GraphLibrary";
import GraphStatus from "../../modules/GraphLibrary/components/GraphStatus/GraphStatus";
import { Data } from "../../modules/Data";
import Project from "../../modules/Project";
import { classNames } from "../../utils/classnames";
import styles from "./MainPage.module.scss";
import QUAlibrateLogoIcon from "../../ui-lib/Icons/QUAlibrateLogoIcon";
import { getIsAuthorized } from "../../stores/AuthStore/selectors";
import { getActiveProject, getShouldGoToProjectPage } from "../../stores/ProjectStore/selectors";

const PageWrapper = ({
  nodeKey,
  children,
}: {
  nodeKey: ModuleKey
  children: React.ReactNode
}) => {
  const { activePage, openedOncePages } = useMainPageContext();

  return openedOncePages.includes(nodeKey)
    ? <div className={classNames(styles.pageWrapper, activePage === nodeKey && styles.active)}>
      {children}
    </div>
    : <></>;
};

const MainPage = () => {
  const isAuthorized = useSelector(getIsAuthorized);
  const { setActivePage, openedOncePages } = useMainPageContext();
  const activeProject = useSelector(getActiveProject);
  const shouldGoToProjectPage = useSelector(getShouldGoToProjectPage);
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
    } else if (!activeProject || shouldGoToProjectPage) {
      setActivePage(PROJECT_KEY);
    } else {
      setActivePage(NODES_KEY);
    }
  }, [isAuthorized, activeProject, shouldGoToProjectPage]);

  return (
    <MainLayout>
      <PageWrapper nodeKey={NODES_KEY}>
        <Nodes />
      </PageWrapper>
      <PageWrapper nodeKey={GRAPH_LIBRARY_KEY}>
        <CalibrationGraph />
      </PageWrapper>
      <PageWrapper nodeKey={GRAPH_STATUS_KEY}>
        <GraphStatus />
      </PageWrapper>
      <PageWrapper nodeKey={DATA_KEY}>
        <Data />
      </PageWrapper>
      <PageWrapper nodeKey={PROJECT_KEY}>
        <Project />
      </PageWrapper>
      {openedOncePages.length === 0 &&
        <div className={styles.emptyPlaceholder}>
          <QUAlibrateLogoIcon height={200} width={400} />
        </div>
      }
    </MainLayout>
  );
};

export default MainPage;
