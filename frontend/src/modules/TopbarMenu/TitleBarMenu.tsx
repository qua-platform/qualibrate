import React, { useEffect, useState } from "react";
import styles from "./styles/TitleBarMenu.module.scss";
import { useFlexLayoutContext } from "../../routing/flexLayout/FlexLayoutContext";
import modulesMap from "../../routing/ModulesRegistry";
import PageName from "../../common/ui-components/common/Page/PageName";
import TitleBarMenuCard from "./TitleBarMenuCard";
import { NodesApi } from "../Nodes/api/NodesAPI";
import TitleBarWorkflowCard from "./TitleBarWorkflowCard";

export interface LastRunStatusGraphResponseDTO {
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

export interface LastRunStatusNodeResponseDTO {
  status: string;
  run_start: string;
  run_duration: number;
  name: string;
  id: number;
  percentage_complete: number;
  time_remaining: number | null;
}

const TitleBarMenu: React.FC = () => {
  const { activeTab, topBarAdditionalComponents } = useFlexLayoutContext();
  const [node, setNode] = useState<LastRunStatusNodeResponseDTO | null>(null);
  const [graph, setGraph] = useState<LastRunStatusGraphResponseDTO | null>(null);

  const fetchStatus = async () => {
    const res = await NodesApi.fetchLastRunStatusInfo();
    if (res.isOk && res.result?.node && res.result?.graph) {
      setNode(res.result.node);
      setGraph(res.result.graph);
    }
    else if (res.isOk && res.result?.node) {
      setNode(res.result.node);
    }
  };

  useEffect(() => {
    const interval = setInterval(async () => fetchStatus(), 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={styles.wrapper}>
      <PageName>{modulesMap[activeTab ?? ""]?.menuItem?.title ?? ""}</PageName>
      {topBarAdditionalComponents && topBarAdditionalComponents[activeTab ?? ""]}
      {graph ? (
        <div className={styles.menuCardsWrapper}>
          <TitleBarWorkflowCard graph={graph} node={node} /> 
        </div>
      ) : node ? (
        <div className={styles.menuCardsWrapper}>
          <TitleBarMenuCard node={node} />
        </div>
      ) : null}
    </div>
  );
};

export default TitleBarMenu;
