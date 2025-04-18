import React, { useEffect, useState } from "react";
import styles from "./styles/TitleBarMenu.module.scss";
import { useFlexLayoutContext } from "../../routing/flexLayout/FlexLayoutContext";
import modulesMap from "../../routing/ModulesRegistry";
import PageName from "../../common/ui-components/common/Page/PageName";
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
  id?: number;
  percentage_complete: number;
  current_action?: string | null;
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
    percentage_complete: 0,
    time_remaining: 0,
  };

  const fallbackGraph: LastRunStatusGraphResponseDTO = {
    name: "",
    status: "pending",
    run_start: "",
    run_end: "",
    total_nodes: 1,
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
        {/* refer to large coment below regarding this logic */}
        {graph ? (
          <TitleBarWorkflowCard graph={ graph } node={node ?? fallbackNode} />
        ) : (
          <TitleBarWorkflowCard graph={ fallbackGraph } node={node ?? fallbackNode} />
        )}
      </div>
    </div>
  );
};

export default TitleBarMenu;


{/** 
  Clarifying TitleBar Display Logic
 
  Objective:
    Define when to display the workflow (graph) card and when to display the node status card in the TitleBarMenu.
 
  Display Rules:
    - If a node is running:
        → Display only the node card.
 
    - If a graph is running:
        → Display the workflow (graph) card, which includes the embedded node card.
 
  Card States:
    Each card can exist in one of the following visual states:
      1. pending   – default/idle state
      2. running
      3. finished
      4. error
      5. (future idea) interrupted – triggered when the stop button is pressed
 
  Observations and Considerations:
    1. Initial state (server startup):
         - Before any node or graph is active, the TitleBarMenu shows both cards in the default (pending) state.
 
    2. Node and graph cards run together:
         - A graph is considered running when each of the nodes in the graph is running.
         - But if only a calibration node is running, then the node card only gets displayed 
 
    3. Completion sync:
         - A graph is considered finished only after all of the nodes to run are finished 
         - And not during a partial run exectuion of the graph 
 
    4. Graph error logic:
         - A graph is in error not only if the current node fails,
           but also if total_nodes < finished_nodes have finished and finished_nodes > 0 (indicating a partial failure to run all nodes in the graph) 
 */}