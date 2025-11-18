import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useRootDispatch } from "..";
import { getAllGraphs, getLastRunWorkflowName, getSelectedWorkflowName } from "./GraphLibrary/selectors";
import { fetchAllCalibrationGraphs, setSelectedWorkflow } from "./GraphLibrary/actions";
import { fetchWorkflowGraph } from "./GraphCommon/actions";

export const useInitGraphs = () => {
  const dispatch = useRootDispatch();
  const selectedWorkflowName = useSelector(getSelectedWorkflowName);
  const allGraphs = useSelector(getAllGraphs);
  const lastRunInfoWorkflowName = useSelector(getLastRunWorkflowName);

  useEffect(() => {
    if (selectedWorkflowName) {
      dispatch(fetchWorkflowGraph(selectedWorkflowName));
      dispatch(setSelectedWorkflow(allGraphs?.[selectedWorkflowName]));
    } else if (lastRunInfoWorkflowName) {
      dispatch(fetchWorkflowGraph(lastRunInfoWorkflowName));
    }
  }, [lastRunInfoWorkflowName, selectedWorkflowName]);

  useEffect(() => {
    dispatch(fetchAllCalibrationGraphs());
  }, []);
};