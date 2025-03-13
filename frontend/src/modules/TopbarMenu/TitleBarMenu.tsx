import React, { useEffect, useState } from "react";
import styles from "./styles/TitleBarMenu.module.scss";
import { useFlexLayoutContext } from "../../routing/flexLayout/FlexLayoutContext";
import modulesMap from "../../routing/ModulesRegistry";
import PageName from "../../common/ui-components/common/Page/PageName";
import TitleBarMenuCard from "./TitleBarMenuCard";

const API_URL = "http://127.0.0.1:8001/execution/last_run/status";

const TitleBarMenu: React.FunctionComponent = () => {
  const { activeTab, topBarAdditionalComponents } = useFlexLayoutContext();
  const [nodeStatus, setNodeStatus] = useState<any>(null);
  const [lastKnownNode, setLastKnownNode] = useState<any>(null);

  const fetchNodeStatus = async () => {
    try {
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error(`API request failed: ${response.status}`);
      const data = await response.json();
      const newNodeStatus = data.node || null;

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
  const isError = nodeStatus?.status === "error";

  const displayedNode = nodeStatus || lastKnownNode;
  const nodeName = displayedNode?.name ?? "No Active Node";
  const progress = displayedNode?.percentage_complete?.toFixed(0) ?? 0;
  const id = displayedNode?.id ?? "No Active Node";
  
  const timeRemaining = isRunning && displayedNode?.time_remaining !== null
    ? `${displayedNode?.time_remaining?.toFixed(1)}s left`
    : "";

  const formattedValue = id === -1 ? nodeName : `#${id} ${nodeName}`;

  const menuCard = {
    label: "Active Node",
    value: formattedValue,
    spinnerIconText: isRunning ? "Running" : isFinished ? "Finished" : "Error",
    dot: isRunning,
    id: timeRemaining,
    percentage: progress,
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
