import React, { useContext, useEffect, useState } from "react";
import { NodeDTO, NodeMap } from "../components/NodeElement/NodeElement";
import noop from "../../../common/helpers";
import { NodesApi } from "../api/NodesAPI";
import { SnapshotsApi } from "../../Snapshots/api/SnapshotsApi";

interface RunningNodeInfo {
  timestampOfRun?: string;
  runDuration?: string;
  status?: string;
  stateUpdates?: string;
}

interface INodesContext {
  selectedNode?: NodeDTO;
  setSelectedNode: (selectedNode: NodeDTO) => void;
  runningNode?: NodeDTO;
  runningNodeInfo?: RunningNodeInfo;
  setRunningNode: (selectedNode: NodeDTO) => void;
  setRunningNodeInfo: (runningNodeInfo: RunningNodeInfo) => void;
  allNodes?: NodeMap;
  setAllNodes: (nodes: NodeMap) => void;
  isNodeRunning: boolean;
  setIsNodeRunning: (value: boolean) => void;
  results?: unknown | object;
  setResults: (value: unknown | object | undefined) => void;
}

const NodesContext = React.createContext<INodesContext>({
  selectedNode: undefined,
  setSelectedNode: noop,
  runningNode: undefined,
  runningNodeInfo: undefined,
  setRunningNode: noop,
  setRunningNodeInfo: noop,
  allNodes: undefined,
  setAllNodes: noop,
  isNodeRunning: false,
  setIsNodeRunning: noop,
  results: undefined,
  setResults: noop,
});

export const useNodesContext = (): INodesContext => useContext<INodesContext>(NodesContext);

interface NodesContextProviderProps {
  children: React.JSX.Element;
}

interface NodeStatusResponseType {
  idx: number;
  status: string;
  name: string;
  state_updates: string[];
}

export function NodesContextProvider(props: NodesContextProviderProps): React.ReactElement {
  const [allNodes, setAllNodes] = useState<NodeMap | undefined>(undefined);
  const [selectedNode, setSelectedNode] = useState<NodeDTO | undefined>(undefined);
  const [runningNode, setRunningNode] = useState<NodeDTO | undefined>(undefined);
  const [runningNodeInfo, setRunningNodeInfo] = useState<RunningNodeInfo | undefined>(undefined);
  const [isNodeRunning, setIsNodeRunning] = useState<boolean>(false);
  const [results, setResults] = useState<unknown | object | undefined>(undefined);
  const [firstRun, setFirstRun] = useState<boolean>(true);

  const fetchAllNodes = async () => {
    const response = await NodesApi.fetchAllNodes();
    if (response.isOk) {
      setAllNodes(response.result! as NodeMap);
    } else if (response.error) {
      console.log(response.error);
    }
  };
  useEffect(() => {
    fetchAllNodes();
  }, []);

  function parseDateString(dateString: string): Date {
    const [datePart, timePart] = dateString.split(" ");
    const [year, month, day] = datePart.split("/").map(Number);
    const [hours, minutes, seconds] = timePart.split(":").map(Number);
    return new Date(year, month - 1, day, hours, minutes, seconds);
  }

  const fetchNodeResults = async (flag: boolean) => {
    const lastRunResponse = await NodesApi.fetchLastRunInfo();
    if (lastRunResponse.isOk) {
      const lastRunResponseResult = lastRunResponse.result as NodeStatusResponseType;
      if (lastRunResponseResult.status !== "error") {
        const idx = lastRunResponseResult.idx.toString();
        // const idx = Math.floor(Math.random() * 100 + 1);
        if (idx && !flag) {
          const snapshotResponse = await SnapshotsApi.fetchSnapshotResult(idx);
          if (snapshotResponse.isOk) {
            console.log("setResults(snapshotResponse.result);");
            if (runningNodeInfo && runningNodeInfo.timestampOfRun) {
              const startDateAndTime: Date = parseDateString(runningNodeInfo?.timestampOfRun);
              const now: Date = new Date();
              const diffInMs = now.getTime() - startDateAndTime.getTime();
              const diffInSeconds = Math.floor(diffInMs / 1000);
              setRunningNodeInfo({
                ...runningNodeInfo,
                runDuration: diffInSeconds.toFixed(2),
                status: lastRunResponseResult.status,
              });
            }
            setResults(snapshotResponse.result);
          } else {
            console.log("snapshotResponse error", snapshotResponse.error);
          }
        } else {
          setFirstRun(false);
          console.log("last run idx is falsy = ", lastRunResponseResult.idx);
        }
      } else {
        console.log("last run status was error");
      }
    } else {
      console.log(lastRunResponse.error);
    }
  };

  useEffect(() => {
    if (!isNodeRunning) {
      fetchNodeResults(firstRun);
    }
  }, [isNodeRunning]);

  const checkIfNodeIsStillRunning = async () => {
    const response = await NodesApi.checkIsNodeRunning();
    if (response.isOk) {
      console.log("checkIfNodeIsStillRunning", response.result);
      setIsNodeRunning(response.result as boolean);
    }
  };
  useEffect(() => {
    const checkInterval = setInterval(async () => checkIfNodeIsStillRunning(), 500);
    return () => clearInterval(checkInterval);
  }, []);

  return (
    <NodesContext.Provider
      value={{
        selectedNode,
        setSelectedNode,
        runningNode,
        setRunningNode,
        runningNodeInfo,
        setRunningNodeInfo,
        allNodes,
        setAllNodes,
        isNodeRunning,
        setIsNodeRunning,
        results,
        setResults,
      }}
    >
      {props.children}
    </NodesContext.Provider>
  );
}
