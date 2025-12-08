import React from "react";
import SidebarMenu from "../../../SidebarMenu/SidebarMenu";
import styles from "./Layout.module.scss";
import Toast from "../../../../components/Toast/Toast";
import TitleBarMenu from "../../../TopbarMenu/TitleBarMenu";
import { RightSidePanel } from "../../../RightSidebar/RightSidePanel";
import WebSocketConnectionErrorDialog from "../../../../components/WebSocketConnectionErrorDialog/WebSocketConnectionErrorDialog";

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
      <Toast />
      <WebSocketConnectionErrorDialog />
    </div>
  );
};

export default MainLayout;
