import { GraphLibraryApi } from "../GraphLibrary";
import { RootDispatch } from "../../../stores";
import graphStatusSlice from "./GraphStatusStore";

export const {
  setAllMeasurements,
  setTrackLatest,
  setSelectedNodeNameInWorkflow: setGraphStatusSelectedNodeNameInWorkflow,
  setSubgraphBreadcrumbs: setGraphStatusSubgraphBreadcrumbs,
  setSubgraphForward: setGraphStatusSubgraphForward,
  setSubgraphBack: setGraphStasetSubgraphBack,
} = graphStatusSlice.actions;

export const fetchAllMeasurements = () => async (dispatch: RootDispatch) => {
  try {
    const response = await GraphLibraryApi.fetchExecutionHistory();
    if (response.isOk) {
      if (response.result && response.result.items) {
        dispatch(setAllMeasurements(response.result.items));
        return response.result.items;
      }
    } else if (response.error) {
      console.log(response.error);
    }
  } catch (error) {
    console.log(error);
  }
  return [];
};
