import React from "react";
import { SidebarMenu } from "../../../SidebarMenu";
import styles from "./Layout.module.scss";
import { Toast, WebSocketConnectionErrorDialog } from "../../../../components";
import { TitleBarMenu } from "../../../TopbarMenu";
import { RightSidePanel } from "../../../RightSidebar";
import { useSelector } from "react-redux";
import { getActivePage } from "../../../../stores/NavigationStore";
import { DATA_KEY } from "../../ModulesRegistry";
import Data from "../../../Data";

interface Props {
  children?: React.ReactNode;
}

const MainLayout = ({ children }: Props) => {
  const activePage = useSelector(getActivePage);

  const isDataPage = activePage === DATA_KEY;

  return (
    <div className={styles.sidebarWrapper}>
      <SidebarMenu />
      {isDataPage ? (
        <Data />
      ) : (
        <div className={styles.titlebarWrapper}>
          <TitleBarMenu />
          <div className={styles.rightsidePanelWrapper}>
            <div className={styles.contentWrapper}>{children}</div>
            <RightSidePanel />
          </div>
        </div>
      )}
      <Toast />
      <WebSocketConnectionErrorDialog />
    </div>
  );
};

export default MainLayout;
