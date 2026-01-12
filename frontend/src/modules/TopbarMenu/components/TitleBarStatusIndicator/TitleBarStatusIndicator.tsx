import React from "react";
import {CircularLoaderPercentage, CheckmarkIcon, ErrorIcon, NoGraphRunningIcon, NoNodeRunningIcon } from "../../../../components";

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

