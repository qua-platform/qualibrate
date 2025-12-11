/**
 * @fileoverview Interactive graph visualization component using ReactFlow.
 *
 * Renders calibration workflow graphs with node selection, auto-layout, and
 * real-time status updates.
 *
 * @see GraphCommonStore - Manages graph and node selection state
 * @see GraphElement - Uses this for workflow preview
 * @see MeasurementElementGraph - Uses this for execution status visualization
 */
import {useCallback, useEffect, useLayoutEffect} from "react";

import styles from "./Graph.module.scss";
import {
  applyEdgeChanges,
  applyNodeChanges,
  Background,
  ConnectionLineType,
  EdgeChange,
  NodeChange,
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import componentTypes, { edgeOptions } from "./components";
import useGraphData from "./hools";
import { NodeWithData } from "../../stores/GraphStores/GraphLibrary";

interface IProps {
  onNodeClick?: (name?: string) => void;
  onSetSubgraphBreadcrumbs?: (key: string) => void
  subgraphBreadcrumbs?: string[]
  selectedWorkflowName?: string
  selectedNodeNameInWorkflow?: string
}

const backgroundColor = "#2b2c32";

const Graph = ({
  onNodeClick,
  selectedWorkflowName,
  subgraphBreadcrumbs,
  onSetSubgraphBreadcrumbs,
  selectedNodeNameInWorkflow,
}: IProps) => {
  const {
    nodes,
    edges,
    setNodes,
    setEdges,
    shouldResetView,
    setShouldResetView,
    selectNode,
  } = useGraphData(
    selectedWorkflowName,
    subgraphBreadcrumbs,
  );
  const { fitView } = useReactFlow();

  useLayoutEffect(() => {
    fitView({
      padding: 0.5,
    });
  }, []);

  useEffect(() => {
    if (shouldResetView) {
      fitView({
        padding: 0.5,
      });
      setShouldResetView(false);
    }
  }, [shouldResetView]);

  useEffect(() => {
    selectedNodeNameInWorkflow && selectNode(selectedNodeNameInWorkflow);
  }, [selectedNodeNameInWorkflow]);

  const handleSelectNode = (id?: string) => {
    selectNode(id);
  };

  const handleNodeClick = (_: React.MouseEvent, node: NodeWithData) => {
    if (!!node.data.subgraph && node.selected) {
      onSetSubgraphBreadcrumbs && onSetSubgraphBreadcrumbs(node.data.label);
      handleSelectNode(undefined);
    } else {
      handleSelectNode(node.data.label);
      onNodeClick && node.data.label && onNodeClick(node.data.label);
    }
  };

  const handleBackgroundClick = (evt: React.MouseEvent) => {
    // Clear selection when clicking graph background
    handleSelectNode(undefined);
  };

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      // Apply changes and dispatch the updated nodes
      setNodes(applyNodeChanges(changes, nodes) as NodeWithData[]);
    },
    [nodes]
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      // Apply changes and dispatch the updated edges
      setEdges(applyEdgeChanges(changes, edges));
    },
    [edges]
  );

  return (
    <div className={styles.wrapper}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        {...componentTypes}
        connectionLineType={ConnectionLineType.SmoothStep}
        onPaneClick={handleBackgroundClick}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={handleNodeClick}
        minZoom={0.1}
        defaultEdgeOptions={edgeOptions}
        fitView
      >
        <Background color={backgroundColor} bgColor={backgroundColor} />
      </ReactFlow>
    </div>
  );
};

export default ({ onNodeClick, selectedWorkflowName, subgraphBreadcrumbs, onSetSubgraphBreadcrumbs, selectedNodeNameInWorkflow }: IProps) => (
  <ReactFlowProvider>
    <Graph
      onNodeClick={onNodeClick}
      selectedWorkflowName={selectedWorkflowName}
      selectedNodeNameInWorkflow={selectedNodeNameInWorkflow}
      subgraphBreadcrumbs={subgraphBreadcrumbs}
      onSetSubgraphBreadcrumbs={onSetSubgraphBreadcrumbs}
    />
  </ReactFlowProvider>
);
