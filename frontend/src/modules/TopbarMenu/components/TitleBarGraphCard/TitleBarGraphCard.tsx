import React, { useCallback } from "react";
import { useSelector } from "react-redux";
/* eslint-disable css-modules/no-unused-class */
import styles from "./styles/TitleBarGraphCard.module.scss";
import TitleBarNodeCard from "../TitleBarNodeCard/TitleBarNodeCard";
import { StopButtonIcon } from "../../../../components";
import Tooltip from "@mui/material/Tooltip";
import TitleBarGraphTooltipContent from "./TitleBarGraphTooltipContent";
import { capitalize, formatTime, getStatusClass, getWrapperClass } from "../../helpers";
import { DEFAULT_TOOLTIP_SX } from "../../constants";
import { StatusIndicator } from "../../components/TitleBarStatusIndicator/TitleBarStatusIndicator";
import { SnapshotsApi } from "../../../../stores/SnapshotsStore";
import { GRAPH_LIBRARY_KEY, GRAPH_STATUS_KEY } from "../../../AppRoutes";
import { setActivePage } from "../../../../stores/NavigationStore";
import { useRootDispatch } from "../../../../stores";
import {
  getRunStatusGraphFinishedNodes,
  getRunStatusGraphPercentageComplete,
  getRunStatusGraphRunDuration,
  getRunStatusGraphName,
  getRunStatusGraphStatus,
  getRunStatusGraphTotalNodes,
  getRunStatusNodeRunDuration,
  getRunStatusNodeStatus,
  getRunStatusGraphTimeRemaining
} from "../../../../stores/WebSocketStore";

const RunningNode = ({ handleStopClick }: { handleStopClick: () => void }) => {
  const timeRemaining = useSelector(getRunStatusGraphTimeRemaining);

  return <div className={styles.stopAndTimeWrapper}>
    <div className={styles.stopButton} onClick={handleStopClick}>
      <StopButtonIcon />
    </div>
    {timeRemaining && (
      <div className={styles.timeRemaining}>{formatTime(timeRemaining)} left</div>
    )}
  </div>;
};

const TitleBarGraphCard: React.FC = () => {
  const dispatch = useRootDispatch();
  const runStatusNodeStatus = useSelector(getRunStatusNodeStatus);
  const runStatusNodeRunDuration = useSelector(getRunStatusNodeRunDuration);
  const runStatusGraphName = useSelector(getRunStatusGraphName);
  const runStatusGraphStatus = useSelector(getRunStatusGraphStatus);
  const percentageComplete = useSelector(getRunStatusGraphPercentageComplete);
  const finishedNodes = useSelector(getRunStatusGraphFinishedNodes);
  const runDuration = useSelector(getRunStatusGraphRunDuration);
  const runStatusGraphTotalNodes = useSelector(getRunStatusGraphTotalNodes);

  const handleOnClick = useCallback(() => {
    dispatch(setActivePage(runStatusGraphStatus === "pending" ? GRAPH_LIBRARY_KEY : GRAPH_STATUS_KEY));
  }, [setActivePage, runStatusGraphStatus]);

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
    <div className={`${styles.graphCardWrapper} ${getWrapperClass(runStatusGraphStatus ?? "pending", styles)}`}>
      <div className={runStatusGraphStatus === "pending" ? styles.defaultGraphCardContent : styles.graphCardContent}>
        <Tooltip title={<TitleBarGraphTooltipContent />} placement="bottom" componentsProps={{ tooltip: { sx: DEFAULT_TOOLTIP_SX } }}>
          <div onClick={handleOnClick} className={styles.hoverRegion}>
            <div className={styles.indicatorWrapper}>
              {StatusIndicator(
                capitalize(runStatusGraphStatus ?? "pending"),
                percentageComplete ?? 0,
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
              {!runStatusGraphStatus ? (
                <>
                  <div className={styles.graphTitleDefault}>No graph is running</div>
                  <div className={styles.graphStatusRow}>
                    <div className={styles.statusPending}>Select and Run Calibration Graph</div>
                  </div>
                </>
              ) : (
                <>
                  <div className={styles.graphTitle}>Graph: {runStatusGraphName || "No graph is running"}</div>
                  <div className={styles.graphStatusRow}>
                    <div className={`${styles.statusText} ${getStatusClass(runStatusGraphStatus ?? "pending", styles)}`}>
                      {runStatusGraphStatus}
                    </div>
                    {runStatusGraphStatus !== "finished" && (
                      <div className={styles.nodeCount}>
                        {finishedNodes}/{runStatusGraphTotalNodes} nodes finished
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </Tooltip>
        <TitleBarNodeCard />
        {runStatusGraphStatus === "running" && <RunningNode handleStopClick={handleStopClick} />}
        {["finished", "error"].includes(runStatusGraphStatus ?? "pending") &&
          runDuration &&
          runDuration > 0 &&
          renderElapsedTime(runDuration)}
        {runStatusGraphStatus === "pending" && runStatusNodeStatus === "running" && (
          <div className={styles.nodeStopButton} onClick={handleStopClick}>
            <StopButtonIcon />
          </div>
        )}
        {runStatusGraphStatus === "pending" &&
          ["finished", "error"].includes(runStatusNodeStatus ?? "pending") &&
          runStatusNodeRunDuration &&
          runStatusNodeRunDuration > 0 &&
          renderElapsedTime(runStatusNodeRunDuration)}
      </div>
    </div>
  );
};

export default TitleBarGraphCard;
