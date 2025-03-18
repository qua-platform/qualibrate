import React, { useEffect, useState } from "react";
import styles from "./styles/TitleBarMenu.module.scss";
import { useFlexLayoutContext } from "../../routing/flexLayout/FlexLayoutContext";
import modulesMap from "../../routing/ModulesRegistry";
import PageName from "../../common/ui-components/common/Page/PageName";
import TitleBarMenuCard from "./TitleBarMenuCard";
import { NodesApi } from "../Nodes/api/NodesAPI";

const TitleBarMenu: React.FC = () => {
  const { activeTab, topBarAdditionalComponents } = useFlexLayoutContext();
  const [node, setNode] = useState<any>(null);

  useEffect(() => {
    const fetchStatus = async () => {
      const res = await NodesApi.fetchLastRunStatusInfo();
      if (res.isOk && res.result?.node) setNode(res.result.node);
    };
    fetchStatus();
    const interval = setInterval(fetchStatus, 1000); // refresh every second
    return () => clearInterval(interval);
  }, []);

  if (!node) return null;

  const formatTime = (sec: number) => {
    const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) % 3600 / 60), s = Math.floor(sec % 60);
    return `${h ? `${h}h ` : ""}${m ? `${m}m ` : ""}${s}s left`;
  };

  const status = node.status;
  const menuCard = {
    label: "Active Node",
    value: node.id === -1 ? node.name : `#${node.id} ${node.name}`,
    spinnerIconText: status === "running" ? "Running" : status === "finished" ? "Finished" : "Error",
    percentage: node.percentage_complete || 0,
    id: status === "running" && node.time_remaining !== null ? formatTime(node.time_remaining) : "",
  };

  return (
    <div className={styles.wrapper}>
      <PageName>{modulesMap[activeTab ?? ""]?.menuItem?.title ?? ""}</PageName>
      {topBarAdditionalComponents && topBarAdditionalComponents[activeTab ?? ""]}
      <div className={styles.menuCardsWrapper}>
        <TitleBarMenuCard card={menuCard} />
      </div>
    </div>
  );
};

export default TitleBarMenu;
