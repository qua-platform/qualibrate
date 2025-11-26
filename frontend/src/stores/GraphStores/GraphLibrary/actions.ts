import { InputParameter } from "../../../modules/common/Parameters/Parameters";
import { GraphWorkflow } from "../../../modules/GraphLibrary/components/GraphList";
import { RootDispatch } from "../../../stores";
import { graphLibrarySlice, GraphMap } from "./GraphLibraryStore";
import { GraphLibraryApi } from "../../../modules/GraphLibrary/api/GraphLibraryApi";

export const {
  setAllGraphs,
  setSelectedWorkflow,
  setLastRunInfo,
  setLastRunActive,
  setIsRescanningGraphs,
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
  dispatch(setIsRescanningGraphs(false));
};
