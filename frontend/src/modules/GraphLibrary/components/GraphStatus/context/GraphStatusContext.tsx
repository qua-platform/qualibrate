import React, { Dispatch, SetStateAction, useContext, useEffect, useState } from "react";
import { ElementDefinition } from "cytoscape";
import noop from "../../../../../common/helpers";
import { GraphLibraryApi } from "../../../api/GraphLibraryApi";
import { useWebSocketData } from "../../../../../contexts/WebSocketContext";

interface GraphProviderProps {
  children: React.JSX.Element;
}

export interface GlobalParameterStructure {
  [key: string]: string | number;
}

export interface Measurement {
  created_at?: string;
  id?: number;
  data?: {
    outcomes: object;
    parameters: GlobalParameterStructure;
    error: object | null;
  };
  metadata?: {
    run_duration?: number;
    name?: string;
    description?: string;
    run_end?: string;
    run_start?: string;
    status?: string;
  };
}

interface IGraphContext {
  allMeasurements?: Measurement[];
  setAllMeasurements: (array: Measurement[] | undefined) => void;

  // selectedMeasurement?: Measurement;
  // setSelectedMeasurement: (measurement: Measurement) => void;

  trackLatest: boolean;
  setTrackLatest: (track: boolean) => void;

  workflowGraphElements?: ElementDefinition[];
  setWorkflowGraphElements: Dispatch<SetStateAction<ElementDefinition[] | undefined>>;

  diffData: unknown | undefined;
  setDiffData: Dispatch<SetStateAction<object | undefined>>;

  result: unknown | undefined;
  setResult: Dispatch<SetStateAction<object | undefined>>;
  // fetchResultsAndDiffData: (snapshotId1: number, snapshotId2?: number, updateResults?: boolean) => void;
  fetchAllMeasurements: () => Promise<Measurement[] | undefined>;
}

const GraphContext = React.createContext<IGraphContext>({
  allMeasurements: undefined,
  setAllMeasurements: noop,

  // selectedMeasurement: undefined,
  // setSelectedMeasurement: noop,

  trackLatest: false,
  setTrackLatest: noop,

  workflowGraphElements: undefined,
  setWorkflowGraphElements: noop,

  diffData: {},
  setDiffData: () => {},

  result: {},
  setResult: () => {},

  // fetchResultsAndDiffData: () => {},
  fetchAllMeasurements: async () => undefined,
});

export const useGraphStatusContext = () => useContext<IGraphContext>(GraphContext);

export const GraphStatusContextProvider = (props: GraphProviderProps): React.ReactElement => {
  const { history } = useWebSocketData();
  const [allMeasurements, setAllMeasurements] = useState<Measurement[] | undefined>(undefined);
  // const [selectedMeasurement, setSelectedMeasurement] = useState<Measurement | undefined>(undefined);
  const [workflowGraphElements, setWorkflowGraphElements] = useState<ElementDefinition[] | undefined>(undefined);
  const [diffData, setDiffData] = useState<unknown | undefined>(undefined);
  const [result, setResult] = useState<unknown | undefined>(undefined);
  const [trackLatest, setTrackLatest] = useState<boolean>(true);

  const fetchAllMeasurements = async () => {
    const response = await GraphLibraryApi.fetchExecutionHistory();
    if (response.isOk) {
      if (response.result && response.result.items) {
        setAllMeasurements(response.result.items);
        return response.result.items;
      }
    } else if (response.error) {
      console.log(response.error);
    }
    return [];
  };

  useEffect(() => {
    fetchAllMeasurements();
  }, []);

  useEffect(() => {
    if (history) {
      setAllMeasurements(history.items);
    }
  }, [history]);

  // const fetchResultsAndDiffData = (snapshotId1: number, snapshotId2?: number, updateResult = true) => {
  //   const id1 = (snapshotId1 ?? 0).toString();
  //   const id2 = snapshotId2 ? snapshotId2.toString() : snapshotId1 - 1 >= 0 ? (snapshotId1 - 1).toString() : "0";
  //   // const id1 = snapshotId1.toString();
  //   // const id2 = snapshotId1 - 1 >= 0 ? (snapshotId1 - 1).toString() : "0";
  //   if (updateResult) {
  //     SnapshotsApi.fetchSnapshotResult(id1)
  //       .then((promise: Res<object>) => {
  //         if (promise.result) {
  //           setResult(promise?.result);
  //         } else {
  //           setResult(undefined);
  //         }
  //       })
  //       .catch((e) => {
  //         console.log(e);
  //       });
  //   }
  //   if (id1 !== id2 && !updateResult) {
  //     SnapshotsApi.fetchSnapshotUpdate(id2, id1)
  //       .then((promise: Res<object>) => {
  //         if (promise.result) {
  //           setDiffData(promise?.result);
  //         } else {
  //           setDiffData({});
  //         }
  //       })
  //       .catch((e) => {
  //         console.log(e);
  //       });
  //   } else {
  //     setDiffData({});
  //   }
  // };

  // useEffect(() => {
  //   const checkInterval = setInterval(async () => fetchAllMeasurements(), 1500);
  //   return () => clearInterval(checkInterval);
  // }, []);

  // useEffect(() => {
  //   if (selectedMeasurementName) {
  //     // fetchMeasurement(selectedMeasurementName);
  //     setSelectedMeasurement(allMeasurements?.[selectedMeasurementName]);
  //   }
  // }, [selectedMeasurementName]);

  return (
    <GraphContext.Provider
      value={{
        allMeasurements,
        setAllMeasurements,
        // selectedMeasurement,
        // setSelectedMeasurement,
        trackLatest,
        setTrackLatest,
        workflowGraphElements,
        setWorkflowGraphElements,
        diffData,
        setDiffData,
        result,
        setResult,
        // fetchResultsAndDiffData,
        fetchAllMeasurements,
      }}
    >
      {props.children}
    </GraphContext.Provider>
  );
};
