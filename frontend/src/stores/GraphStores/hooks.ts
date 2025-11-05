import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useRootDispatch } from "..";
import { getAllGraphs, getLastRunInfo, getSelectedWorkflowName } from "./GraphLibrary/selectors";
import { useWebSocketData } from "../../contexts/WebSocketContext";
import { fetchAllCalibrationGraphs, fetchWorkflowGraph, setLastRunInfo, setSelectedWorkflow } from "./GraphLibrary/actions";

export const initGraphs = () => {
  const dispatch = useRootDispatch();
  const selectedWorkflowName = useSelector(getSelectedWorkflowName)
  const allGraphs = useSelector(getAllGraphs);
  const lastRunInfo = useSelector(getLastRunInfo);
  const { runStatus } = useWebSocketData();

  useEffect(() => {
    if (selectedWorkflowName) {
      dispatch(fetchWorkflowGraph(selectedWorkflowName));
      dispatch(setSelectedWorkflow(allGraphs?.[selectedWorkflowName]));
    } else if (lastRunInfo?.workflowName) {
      dispatch(fetchWorkflowGraph(lastRunInfo?.workflowName));
    }
  }, [lastRunInfo, selectedWorkflowName]);

  useEffect(() => {
    if (runStatus && runStatus.graph && runStatus.node) {
      dispatch(setLastRunInfo({
        ...lastRunInfo,
        active: runStatus.is_running,
        workflowName: runStatus.graph.name,
        activeNodeName: runStatus.node.name ?? "",
        nodesCompleted: runStatus.graph.finished_nodes,
        nodesTotal: runStatus.graph.total_nodes,
        runDuration: runStatus.graph.run_duration,
        error: runStatus.graph.error,
      }));
    }
  }, [runStatus]);

  useEffect(() => {
    dispatch(fetchAllCalibrationGraphs());
  }, []);
}