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
import { useCallback, useEffect, useLayoutEffect } from "react";

import styles from "./Graph.module.scss";
import {
  ReactFlow,
  applyNodeChanges,
  applyEdgeChanges,
  Handle,
  Position,
  useReactFlow,
  ReactFlowProvider,
  ConnectionLineType,
  NodeProps,
  Background,
  NodeChange,
  EdgeChange,
  MarkerType
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { classNames } from "../../../../utils/classnames";
import { getSelectedNodeNameInWorkflow, getShouldResetView, getWorkflowGraphEdges, getWorkflowGraphNodes } from "../../../../stores/GraphStores/GraphCommon/selectors";
import { goForwardInGraph, setEdges, setNodes, setSelectedNodeNameInWorkflow } from "../../../../stores/GraphStores/GraphCommon/actions";
import { setTrackLatest } from "../../../../stores/GraphStores/GraphStatus/actions";
import { useRootDispatch } from "../../../../stores";
import { useSelector } from "react-redux";
import { NodeWithData } from "../../../../stores/GraphStores/GraphCommon/GraphCommonStore";

interface IProps {
  onNodeClick?: (name: string) => void;
}

export const DEFAULT_NODE_TYPE = "DefaultNode";

const DefaultNode = (props: NodeProps<NodeWithData>) => {
  return (
    <div
      className={classNames(
        styles.defaultNode,
        props.selected && styles.selected,
        !!props.data.subgraph && styles.subgraph,
      )}
    >
      <label className={styles.defaultNodeLabel}>{props.data.label}</label>
      <Handle className={styles.defaultNodeHandle} type="target" position={Position.Left} />
      <Handle className={styles.defaultNodeHandle} type="source" position={Position.Right} />
    </div>
  );
};

const nodeTypes = {
  [DEFAULT_NODE_TYPE]: DefaultNode,
};

const backgroundColor = "#2b2c32";
const edgeColor = "#40464d";
const edgeOptions = {
  markerEnd: {
    type: MarkerType.ArrowClosed,
    width: 60,
    height: 8,
    color: edgeColor
  },
  style: {
    strokeWidth: 2,
    stroke: edgeColor,
  },
  selectable: false
};

const Graph = ({ onNodeClick }: IProps) => {
  const nodes = useSelector(getWorkflowGraphNodes);
  const edges = useSelector(getWorkflowGraphEdges);
  const shouldResetView = useSelector(getShouldResetView);
  const selectedNodeNameInWorkflow = useSelector(getSelectedNodeNameInWorkflow);
  const dispatch = useRootDispatch();
  const { fitView } = useReactFlow();

  useLayoutEffect(() => {
    fitView({
      padding: .5,
    });
  }, []);

  useEffect(() => {
    shouldResetView &&
      fitView({
        padding: .5,
      });
  }, [shouldResetView]);

  const handleSelectNode = (id?: string) => {
    dispatch(setSelectedNodeNameInWorkflow(id));
  };

  const handleNodeClick = (_: React.MouseEvent, node: NodeWithData) => {
    if (!!node.data.subgraph && selectedNodeNameInWorkflow === node.data.label) {
      dispatch(goForwardInGraph(node.data.label));
    } else {
      // Disable "track latest" when manually selecting a node
      dispatch(setTrackLatest(false));
      handleSelectNode(node.data.label);
      onNodeClick && node.data.label && onNodeClick(node.data.label);
    }
  };

  const handleBackgroundClick = (evt: React.MouseEvent) => {
    // Clear selection when clicking graph background
    handleSelectNode(undefined);
  };

  const onNodesChange = useCallback((changes: NodeChange[]) => {
    // Apply changes and dispatch the updated nodes
    dispatch(setNodes(applyNodeChanges(changes, nodes)));
  }, [nodes]);

  const onEdgesChange = useCallback((changes: EdgeChange[]) => {
    // Apply changes and dispatch the updated edges
    dispatch(setEdges(applyEdgeChanges(changes, edges)));
  }, [edges]);

  return <div className={styles.wrapper}>
    <ReactFlow
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes}
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
  </div>;
};

export default ({ onNodeClick }: IProps) => (
  <ReactFlowProvider>
    <Graph onNodeClick={onNodeClick} />
  </ReactFlowProvider>
);