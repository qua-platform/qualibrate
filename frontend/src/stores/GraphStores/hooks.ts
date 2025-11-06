import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useRootDispatch } from "..";
import { getAllGraphs, getLastRunInfo, getSelectedWorkflowName } from "./GraphLibrary/selectors";
import { fetchAllCalibrationGraphs, fetchWorkflowGraph, setLastRunInfo, setSelectedWorkflow } from "./GraphLibrary/actions";
import { getRunStatusGraph, getRunStatusIsRunning, getRunStatusNode, getRunStatusNodeName } from "../WebSocketStore/selectors";

export const useInitGraphs = () => {
  const dispatch = useRootDispatch();
  const selectedWorkflowName = useSelector(getSelectedWorkflowName)
  const allGraphs = useSelector(getAllGraphs);
  const lastRunInfo = useSelector(getLastRunInfo);
  const runStatusNodeIsRunning = useSelector(getRunStatusIsRunning);
  const runStatusNodeName = useSelector(getRunStatusNodeName);
  const runStatusGraph = useSelector(getRunStatusGraph);

  useEffect(() => {
    if (selectedWorkflowName) {
      dispatch(fetchWorkflowGraph(selectedWorkflowName));
      dispatch(setSelectedWorkflow(allGraphs?.[selectedWorkflowName]));
    } else if (lastRunInfo?.workflowName) {
      dispatch(fetchWorkflowGraph(lastRunInfo?.workflowName));
    }
  }, [lastRunInfo, selectedWorkflowName]);

  useEffect(() => {
    if (runStatusNodeIsRunning && runStatusGraph && runStatusNodeName) {
      dispatch(setLastRunInfo({
        ...lastRunInfo,
        active: runStatusNodeIsRunning,
        workflowName: runStatusGraph.name,
        activeNodeName: runStatusNodeName ?? "",
        nodesCompleted: runStatusGraph.finished_nodes,
        nodesTotal: runStatusGraph.total_nodes,
        runDuration: runStatusGraph.run_duration,
        error: runStatusGraph.error,
      }));
    }
  }, [runStatusNodeIsRunning, runStatusNodeName, runStatusGraph]);

  useEffect(() => {
    dispatch(fetchAllCalibrationGraphs());
  }, []);
}