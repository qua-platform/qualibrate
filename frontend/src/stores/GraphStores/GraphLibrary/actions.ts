import { InputParameter } from "../../../components";
import { GraphWorkflow } from "../../../modules/GraphLibrary";
import { RootDispatch, RootState } from "../../../stores";
import { graphLibrarySlice, GraphMap } from "./GraphLibraryStore";
import { GraphLibraryApi } from "./api/GraphLibraryApi";
import { getAllGraphs, getSelectedWorkflowName, getSubgraphBreadcrumbs } from "./selectors";
import { setActivePage } from "../../../stores/NavigationStore";
import { GRAPH_STATUS_KEY } from "../../../modules/AppRoutes";
import { setTrackLatest } from "../GraphStatus";

export const {
  setAllGraphs,
  setSelectedWorkflowName,
  setSelectedNodeNameInWorkflow,
  setLastRunInfo,
  setLastRunActive,
  setIsRescanningGraphs,
  setNodeParameter,
  setErrorObject,
  setSubgraphForward,
  setSubgraphBack,
  setSubgraphBreadcrumbs,
} = graphLibrarySlice.actions;

const updateObject = (obj: GraphWorkflow): GraphWorkflow => {
  const modifyParameters = (parameters?: InputParameter, isNodeLevel: boolean = false): InputParameter | undefined => {
    if (parameters?.targets_name) {
      if (isNodeLevel) {
        const targetKey = parameters.targets_name.default?.toString();

        if (targetKey && parameters.targets_name.default) {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { targets_name, [targetKey]: _, ...rest } = parameters;
          return rest;
        }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { targets_name, ...rest } = parameters;
        return rest;
      } else {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { targets_name, ...rest } = parameters;
        return rest;
      }
    }
    return parameters;
  };

  obj.parameters = modifyParameters(obj.parameters, false);

  if (obj.nodes) {
    Object.keys(obj.nodes).forEach((nodeKey) => {
      const node = obj.nodes![nodeKey];
      node.parameters = modifyParameters(node.parameters, true);
    });
  }

  return obj;
};

const updateAllGraphs = (allFetchedGraphs: GraphMap): GraphMap => {
  const updatedGraphs: GraphMap = {};

  Object.entries(allFetchedGraphs).forEach(([key, graph]) => {
    updatedGraphs[key] = updateObject(graph);
  });

  return updatedGraphs;
};

export const fetchAllCalibrationGraphs = (rescan = false) => async (dispatch: RootDispatch) => {
  dispatch(setIsRescanningGraphs(true));
  const response = await GraphLibraryApi.fetchAllGraphs(rescan);
  if (response.isOk) {
    const allFetchedGraphs = response.result! as GraphMap;
    const updatedGraphs = updateAllGraphs(allFetchedGraphs);
    dispatch(setAllGraphs(updatedGraphs));
  } else if (response.error) {
    console.log(response.error);
  }
  // Uncomment to use mocks
  // dispatch(setAllGraphs(MOCK_ALL_GRAPHS));
  dispatch(setIsRescanningGraphs(false));
};


/**
 * Transformed graph structure for API submission.
 * Flattens parameter defaults from InputParameter format to simple key-value pairs.
 */
export interface TransformedNode {
  parameters: {
    [key: string]: string | number | boolean | undefined;
  };
  nodes?: TransformedNodeMap;
}

export interface TransformedNodeMap {
  [key: string]: TransformedNode;
}

export interface TransformedGraph {
  parameters: {
    [key: string]: string | number | boolean | undefined;
  };
  nodes: TransformedNodeMap;
}

/**
 * Submits workflow for execution and opens graph-status panel.
 * Sets `lastRunInfo.active` to trigger UI updates via GraphContext.
 */

export const submitWorkflow = () => async (dispatch: RootDispatch, getState: () => RootState) => {
  const state = getState();
  const allGraphs = getAllGraphs(state);
  const selectedWorkflowName = getSelectedWorkflowName(state);

  const transformParameters = (params?: InputParameter) => {
    let transformedParams = {};
    if (!params) return transformedParams;

    for (const key in params) {
      transformedParams = { ...transformedParams, [key]: params[key].default };
    }
    return transformedParams;
  };

  const transformGraph = (graph: GraphWorkflow): TransformedGraph => {
    const transformed: TransformedGraph = {
      parameters: transformParameters(graph.parameters),
      nodes: {},
    };

    for (const nodeKey in graph.nodes) {
      const node = graph.nodes[nodeKey];
      const isNodeAGraph = "nodes" in node;
      if (isNodeAGraph) {
        const graph = node as GraphWorkflow;
        transformed.nodes[nodeKey] = transformGraph(graph);
        continue;
      }

      transformed.nodes[nodeKey] = {
        parameters: transformParameters(node.parameters),
      };
    }

    return transformed;
  };

  const transformDataForSubmit = () => {
    const input = allGraphs?.[selectedWorkflowName ?? ""];
    if (!input) return;

    return transformGraph(input);
  };

  if (selectedWorkflowName) {
    dispatch(setLastRunActive());
    const response = await GraphLibraryApi.submitWorkflow(selectedWorkflowName, transformDataForSubmit());
    if (response.isOk) {
      dispatch(setErrorObject(undefined)); // This is a bugfix - previously it didn't clear errorObject on success
      dispatch(setActivePage(GRAPH_STATUS_KEY));
      dispatch(setTrackLatest(true));
    } else {
      dispatch(setErrorObject(response.error));
    }
  }
};

export const setGraphNodeParameter = (paramKey: string, newValue: boolean | number | string | string[], nodeId?: string) =>
  (dispatch: RootDispatch, getState: () => RootState) => {
    const subgraphBreadcrumbs = getSubgraphBreadcrumbs(getState());
    const selectedWorkflowName = getSelectedWorkflowName(getState());

    dispatch(setNodeParameter({ paramKey, newValue, nodeId, subgraphBreadcrumbs, selectedWorkflowName}));
  };
