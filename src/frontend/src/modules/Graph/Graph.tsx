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
  NodeChange,
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import useGraphData from "./hooks";
import componentTypes, {edgeOptions} from "./components";
import {EdgeWithData, NodeWithData} from "../../stores/GraphStores/GraphLibrary";
import EdgePopUp from "./components/EdgePopup/EdgePopUp";

interface IProps {
  onNodeClick?: (name?: string) => void;
  onNodeSecondClick?: (key: string, isWorkflow?: boolean) => void;
  subgraphBreadcrumbs?: string[];
  selectedWorkflowName?: string;
  selectedNodeNameInWorkflow?: string;
}

const backgroundColor = "#0d1117";

const Graph = ({ onNodeClick, selectedWorkflowName, subgraphBreadcrumbs, onNodeSecondClick, selectedNodeNameInWorkflow }: IProps) => {
  const { nodes, edges, setNodes, setEdges, shouldResetView, setShouldResetView, selectNode } = useGraphData(
    selectedWorkflowName,
    subgraphBreadcrumbs
  );
  const { fitView } = useReactFlow();
  const [selectedEdge, setSelectedEdge] = useState<EdgeWithData | null>(null);

  const handleEdgeClick = useCallback((evt: MouseEvent, edge: EdgeWithData) => {
    if (edge.data?.condition?.label || edge.data?.loop) setSelectedEdge(edge);
  }, []);

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

  const handleNodeClick = (_: MouseEvent, node: NodeWithData) => {
    if (node.selected) {
      onNodeSecondClick && onNodeSecondClick(node.data.label, !!node.data.subgraph);
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
        connectionLineType={ConnectionLineType.SmoothStep}
        onPaneClick={handleBackgroundClick}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={handleNodeClick}
        onEdgeClick={handleEdgeClick}
        minZoom={0.1}
        defaultEdgeOptions={edgeOptions}
        fitView
      >
        <Background color={backgroundColor} bgColor={backgroundColor} />
      </ReactFlow>
      {selectedEdge && (
        <EdgePopUp
          open={true}
          onClose={handleClosePopup}
          source={selectedEdge.source}
          target={selectedEdge.target}
          info={selectedEdge.data?.condition || selectedEdge.data?.loop}
        />
      )}
    </div>
  );
};

export default ({ onNodeClick, selectedWorkflowName, subgraphBreadcrumbs, onNodeSecondClick, selectedNodeNameInWorkflow }: IProps) => (
  <ReactFlowProvider>
    <Graph
      onNodeClick={onNodeClick}
      selectedWorkflowName={selectedWorkflowName}
      selectedNodeNameInWorkflow={selectedNodeNameInWorkflow}
      subgraphBreadcrumbs={subgraphBreadcrumbs}
      onNodeSecondClick={onNodeSecondClick}
    />
  </ReactFlowProvider>
);
