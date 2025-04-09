import React, { useState } from "react";
import styles from "./styles/RightSidePanel.module.scss";
import { classNames } from "../../utils/classnames";
import { LogsPanel } from "./Logs/LogsPanel";

export const RightSidePanel = () => {
  // const [isQuamOpen, setIsQuamOpen] = useState(false);
  const [isLogsOpen, setIsLogsOpen] = useState(false);

  return (
    <>
      <div className={styles.wrapper}>
        {/*<div*/}
        {/*  className={classNames(styles.tabContainer, isQuamOpen && styles.tabContainerSelected)}*/}
        {/*  onClick={() => setIsQuamOpen(!isQuamOpen)}*/}
        {/*>*/}
        {/*  <span>QUAM</span>*/}
        {/*</div>*/}
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
          <LogsPanel />
        </div>
      )}
    </>
  );
};
