import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useRootDispatch } from "..";
import { getLastRunWorkflowName, fetchAllCalibrationGraphs } from "./GraphLibrary";
import { fetchWorkflowGraph, getSelectedWorkflowName } from "./GraphCommon";

export const useInitGraphs = () => {
  const dispatch = useRootDispatch();
  const selectedWorkflowName = useSelector(getSelectedWorkflowName);
  const lastRunInfoWorkflowName = useSelector(getLastRunWorkflowName);

  useEffect(() => {
    if (selectedWorkflowName) {
      dispatch(fetchWorkflowGraph(selectedWorkflowName));
    } else if (lastRunInfoWorkflowName) {
      dispatch(fetchWorkflowGraph(lastRunInfoWorkflowName));
    }
  }, [lastRunInfoWorkflowName, selectedWorkflowName]);

  useEffect(() => {
    dispatch(fetchAllCalibrationGraphs());
  }, []);
};