import React, { useCallback, useMemo } from "react";

import LoadingBar from "../../../ui-lib/loader/LoadingBar";
import { classNames } from "../../../utils/classnames";
import styles from "./GraphModule.module.scss";
import cyKeys from "../../../utils/cyKeys";
import { useGraphContext } from "./utils/GraphContext";
import { getGraphElements } from "./utils/graph";
// import { useMQTTContext } from "../../MQTT/MQTTContext";
import { isError, isPending } from "../../../utils/statusHelpers";
import { ElementDefinition } from "cytoscape";
import CytoscapeGraph from "./CytoscapeGraph";
import NodeInfoContextContainer, { useNodeInfoContext } from "./utils/NodeInfoContext";
import NodeInfoPopup from "./nodeInfo/NodeInfoPopup";
import { NodeData } from "../types";
import { useOnProjectUpdate } from "../../ActiveProject/utils";

type Props = { active?: boolean };

const GraphModule = () => {
  const { graphData, graphDataStatus, loadGraph } = useGraphContext();
  const { selectNode, selectedNode } = useNodeInfoContext();
  // const { nodesStatus } = useMQTTContext();

  useOnProjectUpdate(loadGraph);

  const graphElements: ElementDefinition[] = useMemo(() => {
    return getGraphElements(graphData, {nodeName: {
        node: 'string',
        msg: 'SOME MESSAGE',
        // resources?: { cpu: string | number; ram: string | number };
        style: "initialised",
      }});
  }, [graphData]);
  // }, [graphData, nodesStatus]);

  const handleNodeClick = useCallback(
    (node: NodeData) => {
      selectNode(node);
    },
    [selectNode]
  );

  const handleClickOutside = useCallback(() => {
    selectNode(undefined);
  }, [selectNode]);

  if (isPending(graphDataStatus)) {
    return <LoadingBar text="Loading graph..." />;
  }

  if (isError(graphDataStatus)) {
    return <LoadingBar text={(graphDataStatus.message as { details: string }).details} />;
  }

  return (
    <div className={styles.graph} data-cy={cyKeys.experiment.GRAPH}>
      <CytoscapeGraph elements={graphElements} onNodeClick={handleNodeClick} onClickOutside={handleClickOutside} />
      {selectedNode && <NodeInfoPopup />}
    </div>
  );
};

export default (props: Props) => (
  <NodeInfoContextContainer>
    {props.active && (
      <div className={classNames(styles.graphView, styles.moduleActive)} data-cy={cyKeys.experiment.WORKFLOW_VIEW}>
        <GraphModule />
      </div>
    )}
  </NodeInfoContextContainer>
);
