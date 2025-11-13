import React from "react";
import SidebarMenu from "../../modules/SidebarMenu/SidebarMenu";
import styles from "./Layout.module.scss";
import ToastComponent from "../../modules/toastModule/ToastComponent";
import TitleBarMenu from "../../modules/TopbarMenu/TitleBarMenu";
import { RightSidePanel } from "../../modules/RightSidebar/RightSidePanel";
import WebSocketConnectionErrorDialog from "../../modules/WebSocketConnectionErrorDialog/WebSocketConnectionErrorDialog";

interface Props {
  children?: React.ReactNode;
}

const MainLayout = ({ children }: Props) => {
  return (
    <div className={styles.sidebarWrapper}>
      <SidebarMenu />
      <div className={styles.titlebarWrapper}>
        <TitleBarMenu />
        <div className={styles.rightsidePanelWrapper}>
          <div className={styles.contentWrapper}>{children}</div>
          <RightSidePanel />
        </div>
      </div>
      <ToastComponent />
      <WebSocketConnectionErrorDialog />
    </div>
  );
};

export default MainLayout;
