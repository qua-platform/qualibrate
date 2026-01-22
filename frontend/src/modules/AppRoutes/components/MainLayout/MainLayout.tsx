import React from "react";
import { SidebarMenu } from "../../../SidebarMenu";
import styles from "./Layout.module.scss";
import { Toast, WebSocketConnectionErrorDialog } from "../../../../components";
import { TitleBarMenu } from "../../../TopbarMenu";
import { RightSidePanel } from "../../../RightSidebar";

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
