import React, { useEffect, useState } from "react";
import styles from "./styles/TitleBarMenu.module.scss";
import { useFlexLayoutContext } from "../../routing/flexLayout/FlexLayoutContext";
import modulesMap from "../../routing/ModulesRegistry";
import PageName from "../../common/ui-components/common/Page/PageName";
import TitleBarMenuCard from "./TitleBarMenuCard";
import { NodesApi } from "../Nodes/api/NodesAPI";

// Define interface to strongly type the API response
export interface LastRunStatusNodeResponseDTO {
  status: "running" | "finished" | "error" | string;
  name: string;
  id: number;
  percentage_complete: number;
  time_remaining: number | null;
}

const TitleBarMenu: React.FC = () => {
  const { activeTab, topBarAdditionalComponents } = useFlexLayoutContext();
  const [node, setNode] = useState<LastRunStatusNodeResponseDTO | null>(null);

  useEffect(() => {
    const fetchStatus = async () => {
      const res = await NodesApi.fetchLastRunStatusInfo();
      if (res.isOk && res.result?.node) setNode(res.result.node);
    };
    fetchStatus();
    const interval = setInterval(fetchStatus, 1000); // fetch api status every second
    return () => clearInterval(interval);
  }, []);

  const formatTime = (sec: number) => {
    const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) % 3600 / 60), s = Math.floor(sec % 60);
    return `${h ? `${h}h ` : ""}${m ? `${m}m ` : ""}${s}s left`;
  };

  const status = node?.status;
  const menuCard = node && {
    label: "Active Node",
    value: node.id === -1 ? node.name : `#${node.id} ${node.name}`,
    spinnerIconText: status === "running" ? "Running" : status === "finished" ? "Finished" : "Error",
    percentage: node.percentage_complete || 0,
    id: status === "running" && node.time_remaining !== null ? formatTime(node.time_remaining) : "",
  };

  // The TitleBarMenuCard appears only after node exists
  return (
    <div className={styles.wrapper}>
      <PageName>{modulesMap[activeTab ?? ""]?.menuItem?.title ?? ""}</PageName>
      {topBarAdditionalComponents && topBarAdditionalComponents[activeTab ?? ""]}
      <div className={styles.menuCardsWrapper}>
        {menuCard && <TitleBarMenuCard card={menuCard} />}
      </div>
    </div>
  );
};

export default TitleBarMenu;
