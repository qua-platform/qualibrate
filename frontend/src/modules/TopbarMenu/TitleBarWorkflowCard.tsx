import React from "react";
import styles from "./styles/TitleBarWorkflowCard.module.scss";
import TitleBarMenuCard from "./TitleBarMenuCard";
import { LastRunStatusNodeResponseDTO } from "./TitleBarMenu";
import CircularLoaderPercentage from "../../ui-lib/Icons/CircularLoaderPercentage";
import CheckmarkIcon from "../../ui-lib/Icons/CheckmarkIcon";
import ErrorIcon from "../../ui-lib/Icons/ErrorIcon";
// import { classNames } from "../../utils/classnames";
import StopButtonIcon from "../../ui-lib/Icons/StopButtonIcon";
import NoNodeRunningIcon from "../../ui-lib/Icons/NoNodeRunningIcon"; // change to figma icon (recently made this exact icon for side bar menu icon update)
import Tooltip from "@mui/material/Tooltip";
import TitleBarWorkflowTooltipContent from "./TitleBarWorkflowTooltipContent";

const StatusIndicator: React.FC<{ status: string; percentage: number }> = ({ status, percentage }) => {
  return (
    <>
      {/* TODO: make hight and width bigger for StatusIndicator icons of workflow card as specified in figma */}
      {/* overload hight and width default parameters here to specified dementions  */}
      {status === "Running" && <CircularLoaderPercentage percentage={percentage ?? 0} />}
      {status === "Finished" && <CheckmarkIcon />}
      {status === "Error" && <ErrorIcon />}
      {status === "Pending" && <NoNodeRunningIcon />}
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

const TitleBarWorkflowCard: React.FC<Props> = ({ graph, node }) => {
  const formatTime = (sec: number | null) => {
    if (sec === null) return "";
    const h = Math.floor(sec / 3600);
    const m = Math.floor(((sec % 3600) % 3600) / 60);
    const s = Math.floor(sec % 60);
    return `${h ? `${h}h ` : ""}${m ? `${m}m ` : ""}${s}s left`;
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

  return (
    <div className={`${styles.workflowCardWrapper} ${getWrapperClass()}`}>
      {graph.status?.toLowerCase() === "pending" ? (
        <>
          <div className={styles.indicatorWrapper}>
            <NoNodeRunningIcon />
          </div>
          <div className={styles.graphDetailsWrapper}>
            <div className={styles.textWrapper}>
              <div className={styles.graphTitle}>No graph is running</div>
              <div className={styles.graphStatusRow}>
                <div className={styles.statusPending}>Select and Run Calibration Graph</div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <Tooltip
          title={<TitleBarWorkflowTooltipContent graph={graph} />}
          placement="bottom-start"
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
          <div className={styles.workflowCardContent}>
            {/* 
              TODO: Fix tooltiphover 
              - only show when hovering over left hand side of graph card 
              - disallow showing both tooltips simultaneously for workflow card and node card 
                - it'sbad UX practice to show two tooltips at once 
              - fix cursor type to pointer when hovering over the graph card 
            */}
            <div className={styles.indicatorWrapper}>
              <StatusIndicator
                status={graph.status?.charAt(0).toUpperCase() + graph.status?.slice(1)}
                percentage={graph.percentage_complete ?? 0}
              />
            </div>
            <div className={styles.graphDetailsWrapper}>
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

            {/* 
              TODO: 
              System feedback: Flash finished TitleBarMenuCard for a split second before loading the next card. 
              This is to give the user a visual cue that the node queued has finished running. 
              If you run a graph you'll notice it immediatly starts running the next node without 
              any visual feedback that the node has finished running. 

              This may just be a problem that solves itself though depending on how the calibration script 
              pauses durring execution to simulate loading.. 
            */}
            <TitleBarMenuCard node={node} />

            {/* TODO: make stop button functional - call function that already implements this */}
            {/* TODO: change time_remaining to show when finished but display as elapsed time instead of the time left format while running */}
            {graph.status?.toLowerCase() === "running" && (
              <div className={styles.stopAndTimeWrapper}>
                <div className={styles.stopButton}>
                  <StopButtonIcon />
                </div>
                {graph.time_remaining !== null && (
                  <div className={styles.timeRemaining}>
                    {formatTime(graph.time_remaining)}
                  </div>
                )}
              </div>
            )}
          </div>
        </Tooltip>
      )}
    </div>
  );
};

export default TitleBarWorkflowCard;
