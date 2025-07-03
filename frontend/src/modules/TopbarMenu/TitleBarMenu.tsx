import React, { useEffect, useState } from "react";
import styles from "./styles/TitleBarMenu.module.scss";
import { useFlexLayoutContext } from "../../routing/flexLayout/FlexLayoutContext";
import modulesMap from "../../routing/ModulesRegistry";
import PageName from "../../common/ui-components/common/Page/PageName";
import TitleBarGraphCard from "./TitleBarGraphCard/TitleBarGraphCard";
import { fallbackGraph, fallbackNode, LastRunStatusGraphResponseDTO, LastRunStatusNodeResponseDTO } from "./constants";
import { useWebSocketData } from "../../contexts/WebSocketContext";

const TitleBarMenu: React.FC = () => {
  const { runStatus } = useWebSocketData();
  const { activeTab, topBarAdditionalComponents } = useFlexLayoutContext();
  const [node, setNode] = useState<LastRunStatusNodeResponseDTO | null>(null);
  const [graph] = useState<LastRunStatusGraphResponseDTO | null>(null);
  const graphToUse = graph ?? fallbackGraph;

  useEffect(() => {
    if (runStatus && runStatus.node) {
      setNode(runStatus.node);
    }
  }, [runStatus]);

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
