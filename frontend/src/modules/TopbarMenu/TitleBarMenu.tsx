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

  // Fetch the active node status
  const fetchNodeStatus = async () => {
    try {
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error(`API request failed: ${response.status}`);
      const data = await response.json();
      setNodeStatus(data.node); // Extract only node info
    } catch (error) {
      console.error("Error fetching node status:", error);
      setNodeStatus(null);
    }
  };

  // Fetch on mount & refresh every 1 second
  useEffect(() => {
    fetchNodeStatus();
    const interval = setInterval(fetchNodeStatus, 1000);
    return () => clearInterval(interval);
  }, []);

  // Extract and handle null cases
  const isRunning = nodeStatus?.status === "running";
  const nodeName = nodeStatus?.name ?? "No Active Node";
  const progress = nodeStatus?.percentage_complete?.toFixed(0) ?? 0;
  const id = nodeStatus?.id ?? "No Active Node";

  // ✅ **Fix:** Only include `timeRemaining` if it's not `null`
  const timeRemaining = isRunning && nodeStatus?.time_remaining !== null
    ? `${nodeStatus?.time_remaining?.toFixed(1)}s`
    : null; // Now `null` instead of "Calculating..."

  // ✅ **Fix:** If `id === -1`, only show `nodeName`
  const formattedValue = id === -1 ? nodeName : `#${id} ${nodeName}`;

  // Define the menu card details
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
