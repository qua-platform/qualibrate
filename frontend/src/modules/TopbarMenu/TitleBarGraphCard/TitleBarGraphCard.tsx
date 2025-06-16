import React from "react";
/* eslint-disable css-modules/no-unused-class */
import  styles from "./styles/TitleBarGraphCard.module.scss";
import TitleBarNodeCard from "../TitleBarNodeCard/TitleBarNodeCard";
import StopButtonIcon from "../../../ui-lib/Icons/StopButtonIcon";
import Tooltip from "@mui/material/Tooltip";
import TitleBarGraphTooltipContent from "./TitleBarGraphTooltipContent";
import { useFlexLayoutContext } from "../../../routing/flexLayout/FlexLayoutContext";
import { getWrapperClass, getStatusClass, formatTime, handleStopClick } from "../helpers";
import { LastRunStatusNodeResponseDTO, LastRunStatusGraphResponseDTO } from "../constants";
import { StatusIndicator } from "../StatusIndicator";

interface GraphCardProps {
  graph: LastRunStatusGraphResponseDTO;
  node: LastRunStatusNodeResponseDTO;
}

const TitleBarGraphCard: React.FC<GraphCardProps> = ({ graph, node }) => {
  const { openTab } = useFlexLayoutContext();
  const isPending = graph.status === "pending";
  const handleClick = () => openTab(isPending ? "graph-library" : "graph-status");

  return (
    <div className={`${styles.graphCardWrapper} ${getWrapperClass(graph.status, styles)}`}>
      <div className={isPending ? styles.defaultGraphCardContent : styles.graphCardContent}>
        <Tooltip
          title={<TitleBarGraphTooltipContent graph={graph} />}
          placement="bottom"
          componentsProps={{
            tooltip: {
              sx: {
                backgroundColor: "#42424C",
                padding: "12px",
                borderRadius: "6px",
                boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
                fontSize: "0.85rem",
                lineHeight: "1.3",
              }
            }
          }}
        >
          <div onClick={handleClick} className={styles.hoverRegion}>
            <div className={styles.indicatorWrapper}>
              {StatusIndicator(
                graph.status?.charAt(0).toUpperCase() + graph.status?.slice(1), 
                graph.percentage_complete ?? 0, 
                {
                  Running: { width: 48, height: 48 },
                  Finished: { width: 48, height: 48 },
                  Error: { width: 48, height: 48 },
                  Pending: { width: 32, height: 32 }
                }, 
                false
              )}
            </div>
            <div className={styles.textWrapper}>
              {isPending ? (
                <>
                  <div className={styles.graphTitleDefault}>No graph is running</div>
                  <div className={styles.graphStatusRow}>
                    <div className={styles.statusPending}>Select and Run Calibration Graph</div>
                  </div>
                </>
              ) : (
                <>
                  <div className={styles.graphTitle}>
                    Graph: {graph.name || "No graph is running"}
                  </div>
                  <div className={styles.graphStatusRow}>
                    <div className={`${styles.statusText} ${getStatusClass(graph.status, styles)}`}>
                      {graph.status}
                    </div>
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

        {/* Graph Stop button and timer */}
        {(!isPending && graph.status === "running") && (
          <div className={styles.stopAndTimeWrapper}>
            <div className={styles.stopButton} onClick={handleStopClick}>
              <StopButtonIcon />
            </div>
            {graph.time_remaining && (
              <div className={styles.timeRemaining}>
                {formatTime(graph.time_remaining)} left
              </div>
            )}
          </div>
        )}

        {(!isPending && graph.status !== "running" && graph.run_duration > 0) && (
          <div className={styles.stopAndTimeWrapper}>
            <div className={styles.timeRemaining}>
              <div>Elapsed time:</div>
              <div className={styles.timeElapsedText}>{formatTime(graph.run_duration)}</div>
            </div>
          </div>
        )}

        {/* Stop button when in pending node (Stops for case when only running a node) */}
        {isPending && node.status === "running" && (
          <div className={styles.nodeStopButton} onClick={handleStopClick}>
            <StopButtonIcon />
          </div>
        )}
      </div>
    </div>
  );
};

export default TitleBarGraphCard;
