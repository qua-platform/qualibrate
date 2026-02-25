import React, { useMemo } from "react";
// eslint-disable-next-line css-modules/no-unused-class
import styles from "./StatusBanner.module.scss";
import { classNames } from "../../../../utils/classnames";
import { useSelector } from "react-redux";
import { getRunStatusNodeStatus } from "../../../../stores/WebSocketStore";
import { getResults, getRunningNodeInfo, getSelectedNode } from "../../../../stores/NodesStore";
import { useLastRunTimeAgo } from "../utils";

const statusClassMap: Record<string, string> = {
  running: styles.statusRunning,
  completed: styles.statusSuccess,
  success: styles.statusSuccess,
  failure: styles.statusError,
  error: styles.statusError,
};

const StatusBanner = () => {
  const selectedNode = useSelector(getSelectedNode);
  const executionStatus = useSelector(getRunStatusNodeStatus) || "";
  const results = useSelector(getResults);
  const runningNodeInfo = useSelector(getRunningNodeInfo);
  const statusTooltip = useLastRunTimeAgo();

  const renderLines = useMemo((): [string, string] => {
    switch (executionStatus) {
      case "success":
      case "completed":
        return ["✓ Execution completed successfully", statusTooltip || ""];
      case "running":
      case "pending":
        return ["Running now...", "Execution in progress"];
      case "failure":
      case "error":
        return ["An error occured", ""];
      default:
        return ["⚡ Ready to run", "Click RUN to configure and execute"];
    }
  }, [executionStatus, statusTooltip]);

  if ((!selectedNode && !results) || (runningNodeInfo?.status && ["pending", "error", "failure"].includes(runningNodeInfo.status)))
    return;

  return (
    <div className={classNames(styles.wrapper, statusClassMap[executionStatus])}>
      <span className={styles.firstLine}>{renderLines[0]}</span>
      <span className={styles.secondLine}>{renderLines[1]}</span>
    </div>
  );
};

export default StatusBanner;
