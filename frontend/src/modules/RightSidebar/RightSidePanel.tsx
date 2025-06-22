import React, { useState } from "react";
import styles from "./styles/RightSidePanel.module.scss";
import { classNames } from "../../utils/classnames";
import { LogsPanel } from "./Logs/LogsPanel";
import { QuamPanel } from "./QuamPanel/QuamPanel";

export const RightSidePanel = () => {
  const [isQuamOpen, setIsQuamOpen] = useState(false);
  const [isLogsOpen, setIsLogsOpen] = useState(false);

  const onQuamClick = () => {
    setIsQuamOpen(!isQuamOpen);
    setIsLogsOpen(false);
  };

  const onLogsClick = () => {
    setIsLogsOpen(!isLogsOpen);
    setIsQuamOpen(false);
  };

  return (
    <>
      <div className={styles.wrapper}>
        <div className={classNames(styles.tabContainer, isQuamOpen && styles.tabContainerSelected)} onClick={onQuamClick}>
          <span>QUAM</span>
        </div>
        <div className={classNames(styles.tabContainer, isLogsOpen && styles.tabContainerSelected)} onClick={onLogsClick}>
          <span>LOGS</span>
        </div>
      </div>
      <>
        {isLogsOpen && (
          <div className={styles.sliderPanelWrapperLogger}>
            <LogsPanel />
          </div>
        )}
        {isQuamOpen && (
          <div className={styles.sliderPanelWrapper}>
            <QuamPanel />
          </div>
        )}
      </>
    </>
  );
};
