import { useEffect } from "react";
import { useSelector } from "react-redux";
import MainLayout from "../MainLayout/MainLayout";
import { useNavigate } from "react-router-dom";
import { LOGIN_URL } from "../../../../utils/api/apiRoutes";
import { DATA_KEY, GRAPH_LIBRARY_KEY, GRAPH_STATUS_KEY, ModuleKey, NODES_KEY, PROJECT_KEY } from "../../ModulesRegistry";
import { Nodes } from "../../../Nodes";
import { GraphLibrary } from "../../../GraphLibrary";
import { GraphStatus } from "../../../GraphStatus";
import { Data } from "../../../Data";
import { Project } from "../../../Project";
import { classNames } from "../../../../utils/classnames";
import styles from "./MainPage.module.scss";
import { QUAlibrateLogoIcon } from "../../../../components";
import { getIsAuthorized } from "../../../../stores/AuthStore";
import { getActiveProject, getShouldGoToProjectPage } from "../../../../stores/ProjectStore";
import { getActivePage, getOpenedOncePages, setActivePage } from "../../../../stores/NavigationStore";
import { useRootDispatch } from "../../../../stores";

const PageWrapper = ({
  nodeKey,
  children,
}: {
  nodeKey: ModuleKey
  children: React.ReactNode
}) => {
  const activePage = useSelector(getActivePage);
  const openedOncePages = useSelector(getOpenedOncePages);

  return openedOncePages.includes(nodeKey)
    ? <div className={classNames(styles.pageWrapper, activePage === nodeKey && styles.active)}>
      {children}
    </div>
    : <></>;
};

const MainPage = () => {
  const isAuthorized = useSelector(getIsAuthorized);
  const dispatch = useRootDispatch();
  const openedOncePages = useSelector(getOpenedOncePages);
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
      dispatch(setActivePage(PROJECT_KEY));
    } else {
      dispatch(setActivePage(NODES_KEY));
    }
  }, [isAuthorized, activeProject, shouldGoToProjectPage]);

  return (
    <MainLayout>
      <PageWrapper nodeKey={NODES_KEY}>
        <Nodes />
      </PageWrapper>
      <PageWrapper nodeKey={GRAPH_LIBRARY_KEY}>
        <GraphLibrary />
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
