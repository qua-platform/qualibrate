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
import {MouseEvent, useCallback, useEffect, useLayoutEffect, useState} from "react";

import styles from "./Graph.module.scss";
import {
  applyEdgeChanges,
  applyNodeChanges,
  Background,
  ConnectionLineType,
  EdgeChange,
  EdgeProps,
  NodeChange,
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import useGraphData from "./hooks";
import componentTypes, { CONDITIONAL_EDGE_TYPE, edgeOptions } from "./components";
import ConditionalEdge from "./components/ConditionalEdge/ConditionalEdge";
import { NodeWithData, EdgeWithData } from "../../stores/GraphStores/GraphLibrary";
import ConditionalEdgePopUp from "./components/ConditionalEdge/ConditionalEdgePopUp";


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
  const [selectedEdge, setSelectedEdge] = useState<EdgeWithData | null>(null);

  const handleConditionClick = useCallback((edge: EdgeWithData) => {
    setSelectedEdge(edge);
  }, []);

  const edgeTypes = {
    ...componentTypes.edgeTypes,
    [CONDITIONAL_EDGE_TYPE]: (props: EdgeProps<EdgeWithData>) => <ConditionalEdge {...props} onConditionClick={handleConditionClick} />,
  };

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

  const handleClosePopup = () => {
    setSelectedEdge(null);
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

  const handleBackgroundClick = (evt: MouseEvent) => {
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
    <div className={styles.wrapper} data-testid="react-flow-graph">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        {...componentTypes}
        nodeTypes={componentTypes.nodeTypes}
        edgeTypes={edgeTypes}
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
      {selectedEdge && (
        <ConditionalEdgePopUp
          open={true}
          onClose={handleClosePopup}
          source={selectedEdge.source}
          target={selectedEdge.target}
          label={selectedEdge.data?.condition?.label}
          description={selectedEdge.data?.condition?.content}
        />
      )}
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
