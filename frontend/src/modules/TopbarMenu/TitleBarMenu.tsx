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

  const fetchNodeStatus = async () => {
    try {
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error(`API request failed: ${response.status}`);
      const data = await response.json();
      setNodeStatus(data.node);
    } catch (error) {
      console.error("Error fetching node status:", error);
      setNodeStatus(null);
    }
  };

  useEffect(() => {
    fetchNodeStatus();
    const interval = setInterval(fetchNodeStatus, 3000);
    return () => clearInterval(interval);
  }, []);

  const isRunning = nodeStatus?.status === "running";
  const nodeName = nodeStatus?.name ?? "No Active Node";
  const progress = nodeStatus?.percentage_complete?.toFixed(0) ?? 0;
  const id = nodeStatus?.id ?? "No Active Node";

  const timeRemaining = isRunning && nodeStatus?.time_remaining !== null
    ? `${nodeStatus?.time_remaining?.toFixed(1)}s`
    : null;

  const formattedValue = id === -1 ? nodeName : `#${id} ${nodeName}`;

  const menuCard = {
    label: "Active Node",
    value: formattedValue, // Use formatted value
    spinnerIconText: isRunning ? "Running" : "Finished",
    dot: isRunning,
    id: timeRemaining ? `${timeRemaining} left` : "N/A",
    percentage: progress,
  };

  return (
    <div className={styles.wrapper} data-testid="title-wrapper">
      <PageName>{modulesMap[activeTab ?? ""]?.menuItem?.title ?? ""}</PageName>
      {topBarAdditionalComponents ? topBarAdditionalComponents[activeTab ?? ""] : undefined}
      
      <div className={styles.menuCardsWrapper}>
        <TitleBarMenuCard card={menuCard} />
      </div>
    </div>
  );
};

export default TitleBarMenu;
