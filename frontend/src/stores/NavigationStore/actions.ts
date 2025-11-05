import { GRAPH_LIBRARY_KEY, NODES_KEY } from "../../routing/ModulesRegistry";
import { RootDispatch, RootState } from "..";
import { fetchAllCalibrationGraphs } from "../GraphStores/GraphLibrary/actions";
import { fetchAllNodes } from "../NodesStore/actions";
import { navigationSlice } from "./NavigationStore";
import { getActivePage } from "./selectors";

export const {
  setActivePage,
} = navigationSlice.actions;

export const refreshPage = () => (dispatch: RootDispatch, getState: () => RootState) => {
  const activePage = getActivePage(getState());

  switch (activePage) {
    case NODES_KEY:
      dispatch(fetchAllNodes(true));
      break;
    case GRAPH_LIBRARY_KEY:
      dispatch(fetchAllCalibrationGraphs(true))
      break;
    default:
      break;
  }
}
