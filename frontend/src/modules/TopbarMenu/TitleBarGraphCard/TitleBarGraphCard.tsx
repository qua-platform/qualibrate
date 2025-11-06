import React, { useCallback } from "react";
import { useSelector } from "react-redux";
/* eslint-disable css-modules/no-unused-class */
import styles from "./styles/TitleBarGraphCard.module.scss";
import TitleBarNodeCard from "../TitleBarNodeCard/TitleBarNodeCard";
import StopButtonIcon from "../../../ui-lib/Icons/StopButtonIcon";
import Tooltip from "@mui/material/Tooltip";
import TitleBarGraphTooltipContent from "./TitleBarGraphTooltipContent";
import { capitalize, formatTime, getStatusClass, getWrapperClass } from "../helpers";
import { DEFAULT_TOOLTIP_SX } from "../constants";
import { StatusIndicator } from "../TitleBarNodeCard/TitleBarStatusIndicator";
import { SnapshotsApi } from "../../Snapshots/api/SnapshotsApi";
import { GRAPH_LIBRARY_KEY, GRAPH_STATUS_KEY } from "../../../routing/ModulesRegistry";
import { setActivePage } from "../../../stores/NavigationStore/actions";
import { useRootDispatch } from "../../../stores";
import { getRunStatusGraph, getRunStatusNodeRunDuration, getRunStatusNodeStatus } from "../../../stores/WebSocketStore/selectors";

const TitleBarGraphCard: React.FC = () => {
  const runStatusGraph = useSelector(getRunStatusGraph);
  const runStatusNodeStatus = useSelector(getRunStatusNodeStatus);
  const runStatusNodeRunDuration = useSelector(getRunStatusNodeRunDuration);
  const dispatch = useRootDispatch();

  const handleOnClick = useCallback(() => {
    dispatch(setActivePage(runStatusGraph?.status === "pending" ? GRAPH_LIBRARY_KEY : GRAPH_STATUS_KEY));
  }, [setActivePage, runStatusGraph?.status]);

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
    <div className={`${styles.graphCardWrapper} ${getWrapperClass(runStatusGraph?.status ?? "pending", styles)}`}>
      <div className={runStatusGraph?.status === "pending" ? styles.defaultGraphCardContent : styles.graphCardContent}>
        <Tooltip title={<TitleBarGraphTooltipContent />} placement="bottom" componentsProps={{ tooltip: { sx: DEFAULT_TOOLTIP_SX } }}>
          <div onClick={handleOnClick} className={styles.hoverRegion}>
            <div className={styles.indicatorWrapper}>
              {StatusIndicator(
                capitalize(runStatusGraph?.status ?? "pending"),
                runStatusGraph?.percentage_complete ?? 0,
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
              {!runStatusGraph?.status ? (
                <>
                  <div className={styles.graphTitleDefault}>No graph is running</div>
                  <div className={styles.graphStatusRow}>
                    <div className={styles.statusPending}>Select and Run Calibration Graph</div>
                  </div>
                </>
              ) : (
                <>
                  <div className={styles.graphTitle}>Graph: {runStatusGraph?.name || "No graph is running"}</div>
                  <div className={styles.graphStatusRow}>
                    <div className={`${styles.statusText} ${getStatusClass(runStatusGraph?.status ?? "pending", styles)}`}>
                      {runStatusGraph?.status}
                    </div>
                    {runStatusGraph?.status !== "finished" && (
                      <div className={styles.nodeCount}>
                        {runStatusGraph?.finished_nodes}/{runStatusGraph?.total_nodes} nodes finished
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </Tooltip>
        <TitleBarNodeCard />
        {runStatusGraph?.status === "running" && (
          <div className={styles.stopAndTimeWrapper}>
            <div className={styles.stopButton} onClick={handleStopClick}>
              <StopButtonIcon />
            </div>
            {runStatusGraph?.time_remaining && (
              <div className={styles.timeRemaining}>{formatTime(runStatusGraph?.time_remaining)} left</div>
            )}
          </div>
        )}
        {["finished", "error"].includes(runStatusGraph?.status ?? "pending") &&
          runStatusGraph?.run_duration &&
          runStatusGraph?.run_duration > 0 &&
          renderElapsedTime(runStatusGraph?.run_duration)}
        {runStatusGraph?.status === "pending" && runStatusNodeStatus === "running" && (
          <div className={styles.nodeStopButton} onClick={handleStopClick}>
            <StopButtonIcon />
          </div>
        )}
        {runStatusGraph?.status === "pending" &&
          ["finished", "error"].includes(runStatusNodeStatus ?? "pending") &&
          runStatusNodeRunDuration &&
          runStatusNodeRunDuration > 0 &&
          renderElapsedTime(runStatusNodeRunDuration)}
      </div>
    </div>
  );
};

export default TitleBarGraphCard;
