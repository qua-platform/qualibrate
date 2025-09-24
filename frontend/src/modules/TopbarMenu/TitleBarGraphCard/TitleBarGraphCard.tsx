import React, { useCallback } from "react";
/* eslint-disable css-modules/no-unused-class */
import styles from "./styles/TitleBarGraphCard.module.scss";
import TitleBarNodeCard from "../TitleBarNodeCard/TitleBarNodeCard";
import StopButtonIcon from "../../../ui-lib/Icons/StopButtonIcon";
import Tooltip from "@mui/material/Tooltip";
import TitleBarGraphTooltipContent from "./TitleBarGraphTooltipContent";
import { useFlexLayoutContext } from "../../../routing/flexLayout/FlexLayoutContext";
import { capitalize, formatTime, getStatusClass, getWrapperClass } from "../helpers";
import { DEFAULT_TOOLTIP_SX } from "../constants";
import { StatusIndicator } from "../TitleBarNodeCard/TitleBarStatusIndicator";
import { SnapshotsApi } from "../../Snapshots/api/SnapshotsApi";
import { useWebSocketData } from "../../../contexts/WebSocketContext";

const TitleBarGraphCard: React.FC = () => {
  const { runStatus } = useWebSocketData();
  const { openTab, setActiveTabsetName } = useFlexLayoutContext();

  const handleOnClick = useCallback(() => {
    openTab(runStatus?.graph?.status === "pending" ? "graph-library" : "graph-status");
    setActiveTabsetName(runStatus?.graph?.status === "pending" ? "graph-library" : "graph-status");
  }, [openTab, setActiveTabsetName, runStatus?.graph?.status]);

  const renderElapsedTime = (time: number) => (
    <div className={styles.stopAndTimeWrapper}>
      <div className={styles.timeRemaining}>
        <div>Elapsed time:</div>
        <div className={styles.timeElapsedText}>{formatTime(time)}</div>
      </div>
    </div>
  );

  const handleStopClick = async () => {
    SnapshotsApi.stopNodeRunning();
  };

  return (
    <div className={`${styles.graphCardWrapper} ${getWrapperClass(runStatus?.graph?.status ?? "pending", styles)}`}>
      <div className={runStatus?.graph?.status === "pending" ? styles.defaultGraphCardContent : styles.graphCardContent}>
        <Tooltip title={<TitleBarGraphTooltipContent />} placement="bottom" componentsProps={{ tooltip: { sx: DEFAULT_TOOLTIP_SX } }}>
          <div onClick={handleOnClick} className={styles.hoverRegion}>
            <div className={styles.indicatorWrapper}>
              {StatusIndicator(
                capitalize(runStatus?.graph?.status ?? "pending"),
                runStatus?.graph?.percentage_complete ?? 0,
                {
                  Running: { width: 48, height: 48 },
                  Finished: { width: 48, height: 48 },
                  Error: { width: 48, height: 48 },
                  Pending: { width: 32, height: 32 },
                },
                false
              )}
            </div>
            <div className={styles.textWrapper}>
              {!runStatus?.graph?.status ? (
                <>
                  <div className={styles.graphTitleDefault}>No graph is running</div>
                  <div className={styles.graphStatusRow}>
                    <div className={styles.statusPending}>Select and Run Calibration Graph</div>
                  </div>
                </>
              ) : (
                <>
                  <div className={styles.graphTitle}>Graph: {runStatus?.graph?.name || "No graph is running"}</div>
                  <div className={styles.graphStatusRow}>
                    <div className={`${styles.statusText} ${getStatusClass(runStatus?.graph?.status ?? "pending", styles)}`}>
                      {runStatus?.graph?.status}
                    </div>
                    {runStatus?.graph?.status !== "finished" && (
                      <div className={styles.nodeCount}>
                        {runStatus?.graph?.finished_nodes}/{runStatus?.graph?.total_nodes} nodes finished
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </Tooltip>
        <TitleBarNodeCard />
        {runStatus?.graph?.status === "running" && (
          <div className={styles.stopAndTimeWrapper}>
            <div className={styles.stopButton} onClick={handleStopClick}>
              <StopButtonIcon />
            </div>
            {runStatus?.graph?.time_remaining && (
              <div className={styles.timeRemaining}>{formatTime(runStatus?.graph?.time_remaining)} left</div>
            )}
          </div>
        )}
        {["finished", "error"].includes(runStatus?.graph?.status ?? "pending") &&
          runStatus?.graph?.run_duration &&
          runStatus?.graph?.run_duration > 0 &&
          renderElapsedTime(runStatus?.graph?.run_duration)}
        {runStatus?.graph?.status === "pending" && runStatus?.node?.status === "running" && (
          <div className={styles.nodeStopButton} onClick={handleStopClick}>
            <StopButtonIcon />
          </div>
        )}
        {runStatus?.graph?.status === "pending" &&
          ["finished", "error"].includes(runStatus?.node?.status ?? "pending") &&
          runStatus?.node?.run_duration &&
          runStatus?.node?.run_duration > 0 &&
          renderElapsedTime(runStatus?.node?.run_duration)}
      </div>
    </div>
  );
};

export default TitleBarGraphCard;
