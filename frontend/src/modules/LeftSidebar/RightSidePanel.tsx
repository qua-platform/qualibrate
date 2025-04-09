import React, { useState } from "react";
import styles from "./styles/RightSidePanel.module.scss";
import { classNames } from "../../utils/classnames";

export const LogsViewer = () => {
  return (
    <>
      <div className={styles.panelHeader}>
        <span>LOGS</span>
      </div>
      <div className={styles.panelContent}>
        <div>
          <div>{"15:22:11 > Risus risus etiam."}</div>
          <div>{"17:22:32 > In praesent iaculis ornare."}</div>
          <div>{"17:22:33 > Vitae interdum molestie sit"}</div>
          <div>{"17:55:01 > Tellus nibh pharetra donec."}</div>
        </div>
      </div>
    </>
  );
};
export const RightSidePanel = () => {
  const [isQuamOpen, setIsQuamOpen] = useState(false);
  const [isLogsOpen, setIsLogsOpen] = useState(false);

  return (
    <>
      <div className={styles.wrapper}>
        <div
          className={classNames(styles.tabContainer, isQuamOpen && styles.tabContainerSelected)}
          onClick={() => setIsQuamOpen(!isQuamOpen)}
        >
          <span>QUAM</span>
        </div>
        <div
          className={classNames(styles.tabContainer, isLogsOpen && styles.tabContainerSelected)}
          onClick={() => setIsLogsOpen(!isLogsOpen)}
        >
          <span>LOGS</span>
        </div>
      </div>
      {/*{(isQuamOpen || isLogsOpen) && (*/}
      {isLogsOpen && (
        <div className={styles.sliderPanelWrapper}>
          <LogsViewer />
        </div>
      )}
    </>
  );
};
