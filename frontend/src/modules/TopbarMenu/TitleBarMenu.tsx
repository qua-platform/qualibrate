import React, { useEffect, useState } from "react";
import styles from "./styles/TitleBarMenu.module.scss";
import { useFlexLayoutContext } from "../../routing/flexLayout/FlexLayoutContext";
import modulesMap from "../../routing/ModulesRegistry";
import PageName from "../../common/ui-components/common/Page/PageName";
import TitleBarMenuCard from "./TitleBarMenuCard";
import { NodesApi } from "../Nodes/api/NodesAPI";

// Define interface to strongly type the API response
export interface LastRunStatusNodeResponseDTO {
  status: "running" | "finished" | "error";
  name: string;
  id: number;
  percentage_complete: number;
  time_remaining: number | null;
}

const TitleBarMenu: React.FunctionComponent = () => {
  const { activeTab, topBarAdditionalComponents } = useFlexLayoutContext();
  const [nodeStatus, setNodeStatus] = useState<LastRunStatusNodeResponseDTO | null>(null);
  const [lastKnownNode, setLastKnownNode] = useState<LastRunStatusNodeResponseDTO | null>(null);

  const fetchNodeStatus = async () => {
    try {
      const response = await NodesApi.fetchLastRunStatusInfo();
      if (!response.isOk) throw new Error(`API request failed: ${response.error}`);
      const newNodeStatus: LastRunStatusNodeResponseDTO | null = response.result?.node || null;

      setNodeStatus(newNodeStatus);

      if (newNodeStatus) {
        setLastKnownNode(newNodeStatus);
      }
    } catch (error) {
      console.error("Error fetching node status:", error);
    }
  };

  useEffect(() => {
    fetchNodeStatus();
    const interval = setInterval(fetchNodeStatus, 1000);
    return () => clearInterval(interval);
  }, []);

  const isRunning = nodeStatus?.status === "running";
  const isFinished = nodeStatus?.status === "finished";
  // const isError = nodeStatus?.status === "error";

  const displayedNode = nodeStatus || lastKnownNode;
  const nodeName = displayedNode?.name ?? "No Active Node";
  const progress = displayedNode?.percentage_complete?.toFixed(0) ?? "0";
  const id = displayedNode?.id ?? -1;

  const timeRemaining = isRunning && displayedNode?.time_remaining !== null
    // TODO: account for minutes and hours (not just seconds)
    ? `${displayedNode?.time_remaining?.toFixed(1)}s left`
    : "";

  const formattedValue = id === -1 ? nodeName : `#${id} ${nodeName}`;

  const menuCard = {
    label: "Active Node",
    value: formattedValue,
    spinnerIconText: isRunning ? "Running" : isFinished ? "Finished" : "Error",
    dot: isRunning,
    id: timeRemaining,
    percentage: parseFloat(progress),
  };

  return (
    <div className={styles.wrapper} data-testid="title-wrapper">
      <PageName>{modulesMap[activeTab ?? ""]?.menuItem?.title ?? ""}</PageName>
      {topBarAdditionalComponents ? topBarAdditionalComponents[activeTab ?? ""] : undefined}

      {lastKnownNode && (
        <div className={styles.menuCardsWrapper}>
          <TitleBarMenuCard card={menuCard} />
        </div>
      )}
    </div>
  );
};

export default TitleBarMenu;
