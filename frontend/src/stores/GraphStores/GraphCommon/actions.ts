import { FetchGraphResponse, GraphLibraryApi } from "../../../modules/GraphLibrary/api/GraphLibraryApi";
import { RootDispatch, RootState } from "../../";
import { commonGraphSlice } from "./GraphCommonStore";
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

export const layoutAndSetNodesAndEdges = (data: FetchGraphResponse) =>
  (dispatch: RootDispatch) =>
    getLayoutedElements(data).then(
      (res) => {
        if (res) {
          dispatch(setNodes(res.nodes));
          dispatch(setEdges(res.edges));
          dispatch(setShouldResetView(true));
        }
      },
    );

export const fetchWorkflowGraph = (nodeName: string) => async (dispatch: RootDispatch, getState: () => RootState) => {
  const response = await GraphLibraryApi.fetchGraph(nodeName);
  if (response.isOk && response.result) {
    const subgraphBreadcrumbs = getSubgraphBreadcrumbs(getState());

    dispatch(setUnformattedWorkflowElements(response.result));
    // Uncomment to use mocks
    // dispatch(setUnformattedWorkflowElements(createSimpleNestedGraph()));

    if (subgraphBreadcrumbs.length) {
      dispatch(setSubgraph());
    } else {
      dispatch(layoutAndSetNodesAndEdges(response.result));
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
    const node = currentGraph.nodes.find(n => n.data.label === key);
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
