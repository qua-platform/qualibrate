import React, { Dispatch, SetStateAction, useContext, useEffect, useState } from "react";
import noop from "../../../common/helpers";
import { GraphWorkflow } from "../components/GraphList";
import { GraphLibraryApi } from "../api/GraphLibraryApi";
import { ElementDefinition } from "cytoscape";
import { InputParameter } from "../../common/Parameters/Parameters";
import { NodesApi } from "../../Nodes/api/NodesAPI";
import { StatusResponseType } from "../../Nodes/context/NodesContext";
import { ErrorObject } from "../../common/Error/ErrorStatusWrapper";
import { useWebSocketData } from "../../../contexts/WebSocketContext";

interface GraphProviderProps {
  children: React.JSX.Element;
}

export interface LastRunInfo {
  workflowName?: string;
  active?: boolean;
  activeNodeName?: string;
  nodesCompleted?: number;
  nodesTotal?: number;
  runDuration?: number;
  status?: string;
  error?: ErrorObject;
  errorMessage?: string;
}

export interface GraphMap {
  [key: string]: GraphWorkflow;
}

interface IGraphContext {
  allGraphs?: GraphMap;
  setAllGraphs: (array: GraphMap | undefined) => void;
  selectedWorkflow?: GraphWorkflow;
  setSelectedWorkflow: (workflow: GraphWorkflow) => void;
  selectedWorkflowName?: string;
  setSelectedWorkflowName: (workflowName: string | undefined) => void;
  selectedNodeNameInWorkflow?: string;
  setSelectedNodeNameInWorkflow: (nodeName: string | undefined) => void;
  workflowGraphElements?: ElementDefinition[];
  setWorkflowGraphElements: Dispatch<SetStateAction<ElementDefinition[] | undefined>>;
  lastRunInfo?: LastRunInfo;
  setLastRunInfo: Dispatch<SetStateAction<LastRunInfo | undefined>>;
  fetchAllCalibrationGraphs: (rescan?: boolean) => void;
  fetchWorkflowGraph: (nodeName: string) => void;
}

const GraphContext = React.createContext<IGraphContext>({
  allGraphs: undefined,
  setAllGraphs: noop,

  selectedWorkflow: undefined,
  setSelectedWorkflow: noop,

  selectedWorkflowName: undefined,
  setSelectedWorkflowName: noop,

  selectedNodeNameInWorkflow: undefined,
  setSelectedNodeNameInWorkflow: noop,

  workflowGraphElements: undefined,
  setWorkflowGraphElements: noop,

  lastRunInfo: undefined,
  setLastRunInfo: noop,
  fetchAllCalibrationGraphs: noop,

  fetchWorkflowGraph: noop,
});

export const useGraphContext = () => useContext<IGraphContext>(GraphContext);

export const GraphContextProvider = (props: GraphProviderProps): React.ReactElement => {
  const { runStatus } = useWebSocketData();

  const [allGraphs, setAllGraphs] = useState<GraphMap | undefined>(undefined);
  const [selectedWorkflow, setSelectedWorkflow] = useState<GraphWorkflow | undefined>(undefined);
  const [selectedWorkflowName, setSelectedWorkflowName] = useState<string | undefined>(undefined);
  const [selectedNodeNameInWorkflow, setSelectedNodeNameInWorkflow] = useState<string | undefined>(undefined);
  const [workflowGraphElements, setWorkflowGraphElements] = useState<ElementDefinition[] | undefined>(undefined);
  const [lastRunInfo, setLastRunInfo] = useState<LastRunInfo | undefined>(undefined);

  const fetchLastRunInfo = async () => {
    const lastRunResponse = await NodesApi.fetchLastRunInfo();
    if (lastRunResponse && lastRunResponse.isOk) {
      const lastRunResponseResult = lastRunResponse.result as StatusResponseType;
      if (lastRunResponseResult && lastRunResponseResult.status !== "error") {
        setLastRunInfo({
          workflowName: (lastRunResponse.result as { name: string })?.name,
          nodesTotal: Object.keys((lastRunResponse.result as StatusResponseType)?.run_result?.parameters?.nodes ?? {}).length,
        });
      } else {
        setLastRunInfo({
          workflowName: (lastRunResponse.result as { name: string })?.name,
          nodesTotal: Object.keys((lastRunResponse.result as StatusResponseType)?.run_result?.parameters?.nodes ?? {}).length,
          status: "error",
          error: lastRunResponse.error as ErrorObject,
        });
        console.log("last run status was error");
      }
    } else {
      console.log("lastRunResponse was ", lastRunResponse);
    }
  };

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

  const fetchAllCalibrationGraphs = async (rescan = false) => {
    const response = await GraphLibraryApi.fetchAllGraphs(rescan);
    if (response.isOk) {
      const allFetchedGraphs = response.result! as GraphMap;
      const updatedGraphs = updateAllGraphs(allFetchedGraphs);
      setAllGraphs(updatedGraphs);
    } else if (response.error) {
      console.log(response.error);
    }
  };

  const fetchWorkflowGraph = async (nodeName: string) => {
    const response = await GraphLibraryApi.fetchGraph(nodeName);
    if (response.isOk) {
      setWorkflowGraphElements(response.result! as ElementDefinition[]);
    } else if (response.error) {
      console.log(response.error);
    }
  };

  // const fetchLastRunWorkflowStatus = async () => {
  //   const response = await GraphLibraryApi.fetchLastWorkflowStatus();
  //   if (response.isOk) {
  //     setLastRunInfo({
  //       ...lastRunInfo,
  //       active: response.result?.active,
  //       activeNodeName: response.result?.active_node_name,
  //       nodesCompleted: response.result?.nodes_completed,
  //       nodesTotal: response.result?.nodes_total,
  //       runDuration: response.result?.run_duration,
  //       error: response.result?.error,
  //     });
  //   } else if (response.error) {
  //     console.log(response.error);
  //   }
  // };

  useEffect(() => {
    fetchAllCalibrationGraphs();
    fetchLastRunInfo();
  }, []);

  useEffect(() => {
    if (lastRunInfo?.workflowName) {
      fetchWorkflowGraph(lastRunInfo?.workflowName);
    }
  }, [lastRunInfo]);

  useEffect(() => {
    if (selectedWorkflowName) {
      fetchWorkflowGraph(selectedWorkflowName);
      setSelectedWorkflow(allGraphs?.[selectedWorkflowName]);
    }
  }, [selectedWorkflowName]);

  // useEffect(() => {
  //   const checkInterval = setInterval(async () => fetchLastRunWorkflowStatus(), 1500);
  //   return () => clearInterval(checkInterval);
  // }, []);

  useEffect(() => {
    if (runStatus && runStatus.graph && runStatus.node) {
      setLastRunInfo({
        ...lastRunInfo,
        active: runStatus.is_running,
        workflowName: runStatus.graph.name,
        activeNodeName: runStatus.node.name ?? "",
        nodesCompleted: runStatus.graph.finished_nodes,
        nodesTotal: runStatus.graph.total_nodes,
        runDuration: runStatus.graph.run_duration,
        error: runStatus.graph.error,
      });
    }
  }, [runStatus]);

  return (
    <GraphContext.Provider
      value={{
        allGraphs,
        setAllGraphs,
        selectedWorkflow,
        setSelectedWorkflow,
        selectedWorkflowName,
        setSelectedWorkflowName,
        selectedNodeNameInWorkflow,
        setSelectedNodeNameInWorkflow,
        workflowGraphElements,
        setWorkflowGraphElements,
        lastRunInfo,
        setLastRunInfo,
        fetchAllCalibrationGraphs,
        fetchWorkflowGraph,
      }}
    >
      {props.children}
    </GraphContext.Provider>
  );
};
