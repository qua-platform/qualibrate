import React from "react";
import CircularLoaderPercentage from "../../ui-lib/Icons/CircularLoaderPercentage";
import CheckmarkIcon from "../../ui-lib/Icons/CheckmarkIcon";
import ErrorIcon from "../../ui-lib/Icons/ErrorIcon";
import NoGraphRunningIcon from "../../ui-lib/Icons/NoGraphRunningIcon";
import NoNodeRunningIcon from "../../ui-lib/Icons/NoNodeRunningIcon";
import { classNames } from "../../utils/classnames";
import styles from "./TitleBarNodeCard/styles/TitleBarNodeCard.module.scss";

type SizeMap = {
  Running?: { width: number; height: number };
  Finished?: { width: number; height: number };
  Error?: { width: number; height: number };
  Pending?: { width: number; height: number };
};

export const StatusIndicator = (
  status: string,
  percentage: number,
  sizes?: SizeMap,
  useNodeIcons = false
): React.ReactElement | null => {
  if (status === "Running") {
    const { width = 48, height = 48 } = sizes?.Running || {};
    return <CircularLoaderPercentage percentage={percentage ?? 0} width={width} height={height} />;
  }

  if (status === "Finished") {
    const { width = 48, height = 48 } = sizes?.Finished || {};
    return <CheckmarkIcon width={width} height={height} />;
  }

  if (status === "Error") {
    const { width = 48, height = 48 } = sizes?.Error || {};
    return <ErrorIcon width={width} height={height} />;
  }

  if (status === "Pending") {
    const { width = 32, height = 32 } = sizes?.Pending || {};
    const PendingIcon = useNodeIcons ? NoNodeRunningIcon : NoGraphRunningIcon;
    return <PendingIcon width={width} height={height} />;
  }

  return null;
};


export const getStatusLabelElement = (status: string | undefined, currentAction?: string): React.ReactNode => {
  const normalizedStatus = status?.toLowerCase();
  if (normalizedStatus === "running") {
    return (
      <div className={classNames(styles.statusContainer, styles.statusRunning)}>
        Running
        <span className={styles.statusRunningValue}>{currentAction ? `: ${currentAction}` : ""}</span>
      </div>
    );
  }
  if (normalizedStatus === "finished") {
    return <div className={classNames(styles.statusContainer, styles.statusFinished)}>Finished</div>;
  }
  if (normalizedStatus === "error") {
    return <div className={classNames(styles.statusContainer, styles.statusError)}>Error</div>;
  }
  return <div className={classNames(styles.statusContainer, styles.statusPending)}>Select and Run Node</div>;
};
