import React from "react";
import styles from "./styles/TitleBarGraphCard.module.scss";
import TitleBarMenuCard from "./TitleBarNodeCard";
import { LastRunStatusNodeResponseDTO } from "./TitleBarMenu";
import CircularLoaderPercentage from "../../ui-lib/Icons/CircularLoaderPercentage";
import CheckmarkIcon from "../../ui-lib/Icons/CheckmarkIcon";
import ErrorIcon from "../../ui-lib/Icons/ErrorIcon";
import StopButtonIcon from "../../ui-lib/Icons/StopButtonIcon";
import { NodesApi } from "../Nodes/api/NodesAPI";
import NoGraphRunningIcon from "../../ui-lib/Icons/NoGraphRunningIcon";
import Tooltip from "@mui/material/Tooltip";
import TitleBarGraphTooltipContent from "./TitleBarGraphTooltipContent";
import { useFlexLayoutContext } from "../../routing/flexLayout/FlexLayoutContext";

const handleStopClick = async () => {
  try {
    const res = await NodesApi.stopRunningGraph();
    if (!res.isOk) {
      console.error("Failed to stop graph:", res.error);
    }
  } catch (err) {
    console.error("Error stopping graph:", err);
  }
};

const StatusIndicator: React.FC<{ status: string; percentage: number }> = ({ status, percentage }) => (
  <>
    {status === "Running" && <CircularLoaderPercentage percentage={percentage ?? 0} height={48} width={48} />}
    {status === "Finished" && <CheckmarkIcon height={48} width={48} />}
    {status === "Error" && <ErrorIcon height={48} width={48} />}
    {status === "Pending" && <NoGraphRunningIcon height={32} width={32} />}
  </>
);

interface LastRunStatusGraphResponseDTO {
  name: string;
  status: string;
  run_start: string;
  run_end: string;
  total_nodes: number;
  finished_nodes: number;
  run_duration: number;
  percentage_complete: number;
  time_remaining: number | null;
}

interface Props {
  graph: LastRunStatusGraphResponseDTO;
  node: LastRunStatusNodeResponseDTO;
}

const TitleBarGraphCard: React.FC<Props> = ({ graph, node }) => {
  const { openTab } = useFlexLayoutContext();

  const formatTime = (sec: number | null) => {
    if (sec === null) return "";
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = Math.floor(sec % 60);
    return `${h ? `${h}h ` : ""}${m ? `${m}m ` : ""}${s}s`;
  };

  const getWrapperClass = () => {
    const status = graph.status?.toLowerCase();
    if (status === "running") return styles.running;
    if (status === "finished") return styles.finished;
    if (status === "error") return styles.error;
    return styles.pending;
  };

  const getStatusClass = () => {
    const status = graph.status?.toLowerCase();
    if (status === "running") return styles.statusRunning;
    if (status === "finished") return styles.statusFinished;
    if (status === "error") return styles.statusError;
    return styles.statusPending;
  };

  // TODO: combine getWrapperClass and getStatusClass as was done similarly in getStatusLabelElement found in TitleBarMenuCard.tsx 
  // TODO: go through and inspect all css in graph card css file and delete all css attributes that dont visibly effect styling  
  
  const isPending = graph.status?.toLowerCase() === "pending";

  const handleClick = () => openTab(isPending ? "graph-library" : "graph-status");

  return (
    <div className={`${styles.graphCardWrapper} ${getWrapperClass()}`}>
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
              <StatusIndicator
                status={graph.status?.charAt(0).toUpperCase() + graph.status?.slice(1)}
                percentage={graph.percentage_complete ?? 0}
              />
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
                    <div className={`${styles.statusText} ${getStatusClass()}`}>
                      {graph.status}
                    </div>
                    <div className={styles.nodeCount}>
                      {graph.finished_nodes}/{graph.total_nodes} nodes finished
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </Tooltip>

        <TitleBarMenuCard node={node} />

        {/* Graph Stop button and timer */}
        {(!isPending && graph.status?.toLowerCase() === "running") && (
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

        {(!isPending && graph.status?.toLowerCase() !== "running" && graph.run_duration > 0) && (
          <div className={styles.stopAndTimeWrapper}>
            <div className={styles.timeRemaining}>
              <div>Elapsed time:</div>
              <div className={styles.timeElapsedText}>{formatTime(graph.run_duration)}</div>
            </div>
          </div>
        )}

        {/* Stop button when in pending node (Stops for case when only running a node) */}
        {isPending && node.status?.toLowerCase() === "running" && (
          <div className={styles.nodeStopButton} onClick={handleStopClick}>
            <StopButtonIcon />
          </div>
        )}
      </div>
    </div>
  );
};

export default TitleBarGraphCard;
