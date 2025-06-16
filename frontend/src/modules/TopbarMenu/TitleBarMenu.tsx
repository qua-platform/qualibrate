import React, { useEffect, useState } from "react";
import styles from "./styles/TitleBarMenu.module.scss";
import { useFlexLayoutContext } from "../../routing/flexLayout/FlexLayoutContext";
import modulesMap from "../../routing/ModulesRegistry";
import PageName from "../../common/ui-components/common/Page/PageName";
import { NodesApi } from "../Nodes/api/NodesAPI";
import TitleBarGraphCard from "./TitleBarGraphCard/TitleBarGraphCard";
import { 
  LastRunStatusNodeResponseDTO, 
  LastRunStatusGraphResponseDTO, 
  fallbackNode,
  fallbackGraph,
} from "./constants";

const TitleBarMenu: React.FC = () => {
  const { activeTab, topBarAdditionalComponents } = useFlexLayoutContext();
  const [node, setNode] = useState<LastRunStatusNodeResponseDTO | null>(null);
  const [graph, setGraph] = useState<LastRunStatusGraphResponseDTO | null>(null);
  const graphToUse = graph ?? fallbackGraph;

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

  return (
    <div className={styles.wrapper}>
      <PageName>{modulesMap[activeTab ?? ""]?.menuItem?.title ?? ""}</PageName>
      {topBarAdditionalComponents && topBarAdditionalComponents[activeTab ?? ""]}
      <div className={styles.menuCardsWrapper}>
        <TitleBarGraphCard graph={graphToUse} node={node ?? fallbackNode} />
      </div>
    </div>
  );
};

export default TitleBarMenu;
