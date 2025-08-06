import React, { useCallback, useEffect, useState } from "react";
/* eslint-disable css-modules/no-unused-class */
import styles from "./styles/TitleBarGraphCard.module.scss";
import TitleBarNodeCard from "../TitleBarNodeCard/TitleBarNodeCard";
import StopButtonIcon from "../../../ui-lib/Icons/StopButtonIcon";
import Tooltip from "@mui/material/Tooltip";
import TitleBarGraphTooltipContent from "./TitleBarGraphTooltipContent";
import { useFlexLayoutContext } from "../../../routing/flexLayout/FlexLayoutContext";
import { capitalize, formatTime, getStatusClass, getWrapperClass } from "../helpers";
import { DEFAULT_TOOLTIP_SX, fallbackGraph, fallbackNode, LastRunStatusNodeResponseDTO } from "../constants";
import { StatusIndicator } from "../TitleBarNodeCard/TitleBarStatusIndicator";
import { SnapshotsApi } from "../../Snapshots/api/SnapshotsApi";
import { GraphItem, useWebSocketData } from "../../../contexts/WebSocketContext";

const TitleBarGraphCard: React.FC = () => {
  const { runStatus } = useWebSocketData();
  const [node, setNode] = useState<LastRunStatusNodeResponseDTO>(fallbackNode);
  const [graph, setGraph] = useState<GraphItem>(fallbackGraph);

  useEffect(() => {
    if (runStatus && runStatus.node) {
      setNode(runStatus.node);
    }
    if (runStatus && runStatus.graph) {
      setGraph(runStatus.graph);
    } else {
      setGraph(fallbackGraph);
    }
  }, [runStatus]);

  const { openTab, setActiveTabsetName } = useFlexLayoutContext();

  const handleOnClick = useCallback(() => {
    openTab(graph.status === "pending" ? "graph-library" : "graph-status");
    setActiveTabsetName(graph.status === "pending" ? "graph-library" : "graph-status");
  }, [openTab, setActiveTabsetName, graph.status]);

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
    <div className={`${styles.graphCardWrapper} ${getWrapperClass(graph.status, styles)}`}>
      <div className={graph.status === "pending" ? styles.defaultGraphCardContent : styles.graphCardContent}>
        <Tooltip
          title={<TitleBarGraphTooltipContent graph={graph} />}
          placement="bottom"
          componentsProps={{ tooltip: { sx: DEFAULT_TOOLTIP_SX } }}
        >
          <div onClick={handleOnClick} className={styles.hoverRegion}>
            <div className={styles.indicatorWrapper}>
              {StatusIndicator(
                capitalize(graph.status),
                graph.percentage_complete ?? 0,
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
              {graph.status === "pending" ? (
                <>
                  <div className={styles.graphTitleDefault}>No graph is running</div>
                  <div className={styles.graphStatusRow}>
                    <div className={styles.statusPending}>Select and Run Calibration Graph</div>
                  </div>
                </>
              ) : (
                <>
                  <div className={styles.graphTitle}>Graph: {graph.name || "No graph is running"}</div>
                  <div className={styles.graphStatusRow}>
                    <div className={`${styles.statusText} ${getStatusClass(graph.status, styles)}`}>{graph.status}</div>
                    {graph.status !== "finished" && (
                      <div className={styles.nodeCount}>
                        {graph.finished_nodes}/{graph.total_nodes} nodes finished
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </Tooltip>
        <TitleBarNodeCard node={node} />
        {graph.status === "running" && (
          <div className={styles.stopAndTimeWrapper}>
            <div className={styles.stopButton} onClick={handleStopClick}>
              <StopButtonIcon />
            </div>
            {graph.time_remaining && <div className={styles.timeRemaining}>{formatTime(graph.time_remaining)} left</div>}
          </div>
        )}
        {["finished", "error"].includes(graph.status) && graph.run_duration > 0 && renderElapsedTime(graph.run_duration)}
        {graph.status === "pending" && node.status === "running" && (
          <div className={styles.nodeStopButton} onClick={handleStopClick}>
            <StopButtonIcon />
          </div>
        )}
        {graph.status === "pending" &&
          ["finished", "error"].includes(node.status) &&
          node.run_duration > 0 &&
          renderElapsedTime(node.run_duration)}
      </div>
    </div>
  );
};

export default TitleBarGraphCard;
