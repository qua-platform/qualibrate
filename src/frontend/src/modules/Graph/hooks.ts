import { MarkerType } from "@xyflow/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { getLayoutedElements } from "./utils";
import { EdgeWithData, FetchGraphResponse, GraphLibraryApi, NodeWithData } from "../../stores/GraphStores/GraphLibrary";
import { LOOPING_EDGE_TYPE } from "./components";
import { MOCK_WORKFLOW_ELEMENTS } from "../../../tests/unit/utils/mocks/workflow";

const DEFAULT_COLOR = "#40464d";
const LIGHT_GREAY = "#70767d";
const GREEN = "#4caf50";
const RED = "#f44336";

const useGraphData = (selectedWorkflowName?: string, subgraphBreadcrumbs?: string[]) => {
  const unformattedWorkflowElements = useRef<FetchGraphResponse | undefined>(undefined);
  const [nodes, setNodes] = useState<NodeWithData[]>([]);
  const [edges, setEdges] = useState<EdgeWithData[]>([]);
  const [shouldResetView, setShouldResetView] = useState<boolean>(true);

  useEffect(() => {
    const fetchWorkflowGraph = async (workflowName: string) => {
      try {
        const response = await GraphLibraryApi.fetchGraph(workflowName);
        if (response.isOk && response.result) {
          // unformattedWorkflowElements.current = response.result;
          // Uncomment to use mocks
          unformattedWorkflowElements.current = MOCK_WORKFLOW_ELEMENTS;

          if (subgraphBreadcrumbs?.length !== 0) {
            setSubgraph();
          } else {
            // layoutAndSetNodesAndEdges(response.result);
            // Uncomment to use mocks
            layoutAndSetNodesAndEdges(MOCK_WORKFLOW_ELEMENTS);
          }
        } else if (response.error) {
          console.log(response.error);
        }
      } catch (error) {
        console.log(error);
      }
    };

    if (selectedWorkflowName) fetchWorkflowGraph(selectedWorkflowName);
  }, [selectedWorkflowName]);

  const resetWorkflowGraphElements = () => {
    unformattedWorkflowElements.current = undefined;
    setNodes([]);
    setEdges([]);
  };

  const layoutAndSetNodesAndEdges = (data: FetchGraphResponse) =>
    getLayoutedElements(data).then((res) => {
      if (res) {
        setNodes(res.nodes as NodeWithData[]);
        setEdges(
          res.edges.map((edge) => {
            let color = DEFAULT_COLOR;

            if (edge.type === LOOPING_EDGE_TYPE) {
              color = LIGHT_GREAY;
            } else {
              if (edge.data?.connect_on === true) {
                color = GREEN;
              } else if (edge.data?.connect_on === false) {
                color = RED;
              }
            }

            return {
              ...edge,
              style: {
                strokeWidth: 2,
                stroke: color,
              },
              markerEnd: {
                type: MarkerType.ArrowClosed,
                width: 60,
                height: 8,
                color,
              },
            };
          })
        );
        setShouldResetView(true);
      }
    });

  useEffect(() => {
    setSubgraph();
    setShouldResetView(true);
  }, [subgraphBreadcrumbs]);

  const setSubgraph = useCallback(() => {
    if (!unformattedWorkflowElements.current) {
      resetWorkflowGraphElements();
      return;
    }

    const graph = (subgraphBreadcrumbs || []).reduce((currentGraph, key) => {
      const node = currentGraph.nodes.find((n) => n.data.label === key);
      return node?.data.subgraph ?? currentGraph;
    }, unformattedWorkflowElements.current);

    layoutAndSetNodesAndEdges(graph);
  }, [unformattedWorkflowElements, subgraphBreadcrumbs]);

  const selectNode = useCallback(
    (selectedNode?: string) => {
      setNodes(
        nodes.map((node) => ({
          ...node,
          selected: selectedNode === node.data.label,
        }))
      );
    },
    [nodes]
  );

  return {
    nodes,
    edges,
    setNodes,
    setEdges,
    shouldResetView,
    setShouldResetView,
    selectNode,
  };
};

export default useGraphData;
