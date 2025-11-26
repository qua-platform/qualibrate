import { GraphLibraryApi } from "../../../modules/GraphLibrary/api/GraphLibraryApi";
import { RootDispatch } from "../../";
import { commonGraphSlice } from "./GraphCommonStore";
import { Edge, Node } from "@xyflow/react";
import { getLayoutedElements } from "./utils";

export const {
  setSelectedNodeNameInWorkflow,
  resetWorkflowGraphElements,
  setNodes,
  setEdges,
  setShouldResetView,
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

export const fetchWorkflowGraph = (nodeName: string) => async (dispatch: RootDispatch) => {
  const response = await GraphLibraryApi.fetchGraph(nodeName);
  if (response.isOk) {
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

    dispatch(layoutAndSetNodesAndEdges({ nodes, edges }));
  } else if (response.error) {
    console.log(response.error);
  }
};
