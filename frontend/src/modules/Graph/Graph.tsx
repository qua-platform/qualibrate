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
import {
  getSelectedNodeNameInWorkflow,
  getShouldResetView,
  getWorkflowGraphEdgesColored,
  getWorkflowGraphNodes,
  goForwardInGraph,
  setEdges,
  setNodes,
  setSelectedNodeNameInWorkflow,
  EdgeWithData,
  NodeWithData,
} from "../../stores/GraphStores/GraphCommon";
import {setTrackLatest} from "../../stores/GraphStores/GraphStatus";
import {useRootDispatch} from "../../stores";
import {useSelector} from "react-redux";
import componentTypes, {CONDITIONAL_EDGE_TYPE, edgeOptions} from "./components";
import ConditionalEdge from "./components/ConditionalEdge/ConditionalEdge";
import ConditionalEdgePopUp from "./components/ConditionalEdge/ConditionalEdgePopUp";

interface IProps {
  onNodeClick?: (name: string) => void;
}

const backgroundColor = "#2b2c32";

const Graph = ({ onNodeClick }: IProps) => {
  const nodes = useSelector(getWorkflowGraphNodes);
  const edges = useSelector(getWorkflowGraphEdgesColored);
  const shouldResetView = useSelector(getShouldResetView);
  const selectedNodeNameInWorkflow = useSelector(getSelectedNodeNameInWorkflow);
  const dispatch = useRootDispatch();
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
    shouldResetView &&
      fitView({
        padding: 0.5,
      });
  }, [shouldResetView]);

  const handleSelectNode = (id?: string) => {
    dispatch(setSelectedNodeNameInWorkflow(id));
  };

  const handleClosePopup = () => {
    setSelectedEdge(null);
  };

  const handleNodeClick = (_: MouseEvent, node: NodeWithData) => {
    if (!!node.data.subgraph && selectedNodeNameInWorkflow === node.data.label) {
      dispatch(goForwardInGraph(node.data.label));
      handleSelectNode(undefined);
    } else {
      // Disable "track latest" when manually selecting a node
      dispatch(setTrackLatest(false));
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
      dispatch(setNodes(applyNodeChanges(changes, nodes)));
    },
    [nodes]
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      // Apply changes and dispatch the updated edges
      dispatch(setEdges(applyEdgeChanges(changes, edges)));
    },
    [edges]
  );

  return (
    <div className={styles.wrapper}>
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

export default ({ onNodeClick }: IProps) => (
  <ReactFlowProvider>
    <Graph onNodeClick={onNodeClick} />
  </ReactFlowProvider>
);
