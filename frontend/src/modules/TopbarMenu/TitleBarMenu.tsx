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
    if (res.isOk && res.result) {
      setNode(res.result.node ?? null);
      setGraph(res.result.graph ?? null);
    }
  };

  useEffect(() => {
    const interval = setInterval(fetchStatus, 1000);
    return () => clearInterval(interval);
  }, []);

  const fallbackNode: LastRunStatusNodeResponseDTO = {
    status: "pending",
    run_start: "",
    run_duration: 0,
    name: "",
    id: -1,
    percentage_complete: 0,
    time_remaining: 0,
  };

  const fallbackGraph: LastRunStatusGraphResponseDTO = {
    name: "",
    status: "pending",
    run_start: "",
    run_end: "",
    total_nodes: 0,
    finished_nodes: 0,
    run_duration: 0,
    percentage_complete: 0,
    time_remaining: 0,
  };

  return (
    <div className={styles.wrapper}>
      <PageName>{modulesMap[activeTab ?? ""]?.menuItem?.title ?? ""}</PageName>
      {topBarAdditionalComponents && topBarAdditionalComponents[activeTab ?? ""]}

      <div className={styles.menuCardsWrapper}>
        {graph ? (
          <TitleBarWorkflowCard graph={graph ?? fallbackGraph} node={node ?? fallbackNode} />
        ) : (
          <TitleBarMenuCard node={node ?? fallbackNode} />
        )}
      </div>
    </div>
  );
};

export default TitleBarMenu;
