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

const StatusIndicator: React.FC<{ status: string; percentage: number }> = ({ status, percentage }) => {
  return (
    <>
      {status === "Running" && <CircularLoaderPercentage percentage={percentage ?? 0} height={54} width={54} />}
      {status === "Finished" && <CheckmarkIcon height={48} width={48} />}
      {status === "Error" && <ErrorIcon height={48} width={48} />}
    </>
  );
};

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
    const m = Math.floor(((sec % 3600) % 3600) / 60);
    const s = Math.floor(sec % 60);
    return `${h ? `${h}h ` : ""}${m ? `${m}m ` : ""}${s}s`;
  };

  const getWrapperClass = (): string => {
    const status = graph.status?.toLowerCase();
    if (status === "running") return styles.running;
    if (status === "finished") return styles.finished;
    if (status === "error") return styles.error;
    return styles.pending;
  };

  const getStatusClass = (): string => {
    const status = graph.status?.toLowerCase();
    if (status === "running") return styles.statusRunning;
    if (status === "finished") return styles.statusFinished;
    if (status === "error") return styles.statusError;
    return styles.statusPending;
  };

  // TODO: refactor tooltiphover into just a single use for both cases like the node status card 
  // TODO: signal error in graph status when not all nodes finish in calibration test
  // TODO: if graph is running, clicking node card takes you to graph-status page, else it takes you to node library 
  // TODO: combine getWrapperClass and getStatusClass as was done similarly in getStatusLabelElement found in TitleBarMenuCard.tsx 
  // TODO: Do a final matching between all stylings of css and elements to figma and try to match everything as close as possible in coloring and spacing 
  // TODO: delete all the unnessary comments and code and overall shorten the PR 
  // TODO: add slight shade effect when hovering over node card as well 

  return (
    <div className={`${styles.graphCardWrapper} ${getWrapperClass()}`}>
      {graph.status?.toLowerCase() === "pending" ? (
        <div className={styles.defaultGraphCardContent}>
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
            <div onClick={() => openTab("graph-library")} className={styles.hoverRegion}>
              <div className={styles.indicatorWrapper}>
                <NoGraphRunningIcon height={32} width={32} />
              </div>
              <div className={styles.textWrapper}>
                <div className={styles.graphTitleDefault}>No graph is running</div>
                <div className={styles.graphStatusRow}>
                  <div className={styles.statusPending}>Select and Run Calibration Graph</div>
                </div>
              </div>
            </div>
          </Tooltip>
          <TitleBarMenuCard node={node} />
          {node.status?.toLowerCase() === "running" && (
            <div className={styles.stopButton} onClick={handleStopClick}>
              <StopButtonIcon height={24} />
            </div>
          )}
        </div>
      ) : (
        <div className={styles.graphCardContent}>
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
            <div onClick={() => openTab("graph-status")} className={styles.hoverRegion}>
              <div className={styles.indicatorWrapper}>
                <StatusIndicator
                  status={graph.status?.charAt(0).toUpperCase() + graph.status?.slice(1)}
                  percentage={graph.percentage_complete ?? 0}
                />
              </div>
              <div className={styles.textWrapper}>
                <div className={styles.graphTitle}>
                  Active Graph: {graph.name || "No graph is running"}
                </div>
                <div className={styles.graphStatusRow}>
                  <div className={`${styles.statusText} ${getStatusClass()}`}>
                    {graph.status}
                  </div>
                  <div className={styles.nodeCount}>
                    {graph.finished_nodes}/{graph.total_nodes} nodes finished
                  </div>
                </div>
              </div>
            </div>
          </Tooltip>
          <TitleBarMenuCard node={node} />
          {graph.status?.toLowerCase() === "running" && (
            <div className={styles.stopAndTimeWrapper}>
              <div className={styles.stopButton} onClick={handleStopClick}>
                <StopButtonIcon height={24} />
              </div>
              {graph.time_remaining && (
                <div className={styles.timeRemaining}>
                  {formatTime(graph.time_remaining)} left
                </div>
              )}
            </div>
          )}
          {graph.status?.toLowerCase() !== "running" && graph.run_duration > 0 && (
            <div className={styles.stopAndTimeWrapper}>
              <div className={styles.timeRemaining}>
                <div>Elapsed time:</div>
                <div className={styles.timeElapsedText}>{formatTime(graph.run_duration)}</div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TitleBarGraphCard;
