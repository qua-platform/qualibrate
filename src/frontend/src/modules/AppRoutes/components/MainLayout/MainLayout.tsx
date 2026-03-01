import React from "react";
import { SidebarMenu } from "../../../SidebarMenu";
import styles from "./Layout.module.scss";
import { Toast, WebSocketConnectionErrorDialog } from "../../../../components";
import { TitleBarMenu } from "../../../TopbarMenu";
import { RightSidePanel } from "../../../RightSidebar";

interface Props {
  content?: React.ReactNode;
  leftPanel?: React.ReactNode;
  customTitle?: string;
}

const MainLayout = ({ content: children, leftPanel, customTitle }: Props) => {
  return (
    <div className={styles.sidebarWrapper}>
      <SidebarMenu />
      {leftPanel}
      <div className={styles.titlebarWrapper}>
        <TitleBarMenu customTitle={customTitle} />
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
