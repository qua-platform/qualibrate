import { GraphLibraryApi } from "../../../modules/GraphLibrary/api/GraphLibraryApi";
import { RootDispatch, RootState } from "../../";
import { commonGraphSlice } from "./GraphCommonStore";
import { Edge, Node } from "@xyflow/react";
import { getLayoutedElements } from "./utils";
import { getSubgraphBreadcrumbs, getUnformattedWorkflowElements } from "./selectors";

export const {
  setSelectedWorkflowName,
  setSelectedNodeNameInWorkflow,
  setUnformattedWorkflowElements,
  resetWorkflowGraphElements,
  setNodes,
  setEdges,
  setShouldResetView,
  setSubgraphForward,
  setSubgraphBack,
} = commonGraphSlice.actions;

export const layoutAndSetNodesAndEdges = ({ nodes, edges }: { nodes: Node[], edges: Edge[] }) =>
  (dispatch: RootDispatch) =>
    getLayoutedElements(nodes, edges).then(
      (res) => {
        if (res) {
          dispatch(setNodes(res.nodes));
          dispatch(setEdges(res.edges));
          dispatch(setShouldResetView(true));
        }
      },
    );

const defaultPosition = {
  x: 100,
  y: 100,
};

export const fetchWorkflowGraph = (nodeName: string) => async (dispatch: RootDispatch, getState: () => RootState) => {
  const response = await GraphLibraryApi.fetchGraph(nodeName);
  if (response.isOk) {
    const subgraphBreadcrumbs = getSubgraphBreadcrumbs(getState());
    const nodes = (response.result || [])
      .filter(item => item.group === "nodes" && !!item.data.id)
      .map(node => ({
        id: node.data.id,
        position: node.position || defaultPosition,
        data: {}
      }));

    const edges = (response.result || [])
      .filter(item => item.group === "edges")
      .map(edge => ({
        id: edge.data.id || "",
        source: edge.data.source,
        target: edge.data.target,
        data: {}
      }));

    dispatch(setUnformattedWorkflowElements({ nodes, edges }));
    // Uncomment to use mocks
    // dispatch(setUnformattedWorkflowElements(createSimpleNestedGraph()));

    if (subgraphBreadcrumbs.length) {
      dispatch(setSubgraph());
    } else {
      dispatch(layoutAndSetNodesAndEdges({ nodes, edges }));
      // Uncomment to use mocks
      // dispatch(layoutAndSetNodesAndEdges(createSimpleNestedGraph()));
    }
  } else if (response.error) {
    console.log(response.error);
  }
};

export const setSubgraph = () => (dispatch: RootDispatch, getState: () => RootState) => {
  const state = getState();
  const subgraphBreadcrumbs = getSubgraphBreadcrumbs(state);
  const workflowElements = getUnformattedWorkflowElements(state);

  if (!workflowElements) {
    dispatch(resetWorkflowGraphElements());
    return;
  }

  const graph = subgraphBreadcrumbs.reduce((currentGraph, key) => {
    const node = currentGraph.nodes.find(n => n.id === key);
    return node?.data.subgraph ?? currentGraph;
  }, workflowElements);

  dispatch(layoutAndSetNodesAndEdges(graph));
};

export const goForwardInGraph = (key: string) => (dispatch: RootDispatch) => {
  dispatch(setSubgraphForward(key));
  dispatch(setSubgraph());
};

export const goBackInGraph = (index: number) => (dispatch: RootDispatch) => {
  dispatch(setSubgraphBack(index));
  dispatch(setSubgraph());
};
