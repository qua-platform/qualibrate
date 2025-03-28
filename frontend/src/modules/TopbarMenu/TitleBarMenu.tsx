import React, { useEffect, useState } from "react";
import styles from "./styles/TitleBarMenu.module.scss";
import { useFlexLayoutContext } from "../../routing/flexLayout/FlexLayoutContext";
import modulesMap from "../../routing/ModulesRegistry";
import PageName from "../../common/ui-components/common/Page/PageName";
import TitleBarMenuCard from "./TitleBarMenuCard";
import { NodesApi } from "../Nodes/api/NodesAPI";

export interface LastRunStatusNodeResponseDTO {
  status: string;
  run_start: string;
  run_duration: number;
  name: string;
  id?: number;
  percentage_complete: number;
  current_action?: string | null;
  time_remaining: number | null;
}

const TitleBarMenu: React.FC = () => {
  const { activeTab, topBarAdditionalComponents } = useFlexLayoutContext();
  const [node, setNode] = useState<LastRunStatusNodeResponseDTO | null>(null);

  const fetchStatus = async () => {
    const res = await NodesApi.fetchLastRunStatusInfo();
    if (res.isOk && res.result?.node) {
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

      <div className={styles.menuCardsWrapper}>
        <TitleBarMenuCard
          node={
            node ?? {
              status: "pending",
              run_start: "",
              run_duration: 0,
              name: "",
              percentage_complete: 0,
              time_remaining: 0,
            }
          }
        />
      </div>
    </div>
  );
};

export default TitleBarMenu;
