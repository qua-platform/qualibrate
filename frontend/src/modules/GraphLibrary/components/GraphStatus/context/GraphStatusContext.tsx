import React, { Dispatch, SetStateAction, useContext, useEffect, useState } from "react";
import { ElementDefinition } from "cytoscape";
import noop from "../../../../../common/helpers";
import { GraphLibraryApi } from "../../../api/GraphLibraryApi";
import { SnapshotsApi } from "../../../../Snapshots/api/SnapshotsApi";
import { Res } from "../../../../../common/interfaces/Api";

interface GraphProviderProps {
  children: React.JSX.Element;
}

export interface GlobalParameterStructure {
  [key: string]: string | number;
}

export interface Measurement {
  snapshot_idx?: number;
  name?: string;
  description?: string;
  outcomes: object;
  parameters: GlobalParameterStructure;
  run_start: string;
  run_end: string;
  run_duration: number;
}

interface IGraphContext {
  allMeasurements?: Measurement[];
  setAllMeasurements: (array: Measurement[] | undefined) => void;

  selectedMeasurement?: Measurement;
  setSelectedMeasurement: (measurement: Measurement) => void;

  trackLatest: boolean;
  setTrackLatest: (track: boolean) => void;

  workflowGraphElements?: ElementDefinition[];
  setWorkflowGraphElements: Dispatch<SetStateAction<ElementDefinition[] | undefined>>;

  diffData: unknown | undefined;
  setDiffData: Dispatch<SetStateAction<object | undefined>>;

  result: unknown | undefined;
  setResult: Dispatch<SetStateAction<object | undefined>>;
  fetchResultsAndDiffData: (snapshotId: number) => void;
  fetchAllMeasurements: () => Promise<Measurement[] | undefined>;
}

const GraphContext = React.createContext<IGraphContext>({
  allMeasurements: undefined,
  setAllMeasurements: noop,

  selectedMeasurement: undefined,
  setSelectedMeasurement: noop,

  trackLatest: false,
  setTrackLatest: noop,

  workflowGraphElements: undefined,
  setWorkflowGraphElements: noop,

  diffData: {},
  setDiffData: () => {},

  result: {},
  setResult: () => {},

  fetchResultsAndDiffData: () => {},
  fetchAllMeasurements: async () => undefined,
});

export const useGraphStatusContext = () => useContext<IGraphContext>(GraphContext);

export const GraphStatusContextProvider = (props: GraphProviderProps): React.ReactElement => {
  const [allMeasurements, setAllMeasurements] = useState<Measurement[] | undefined>(undefined);
  const [selectedMeasurement, setSelectedMeasurement] = useState<Measurement | undefined>(undefined);
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

  const fetchResultsAndDiffData = (snapshotId: number) => {
    const id1 = snapshotId.toString();
    const id2 = snapshotId - 1 >= 0 ? (snapshotId - 1).toString() : "0";
    SnapshotsApi.fetchSnapshotResult(id1)
      .then((promise: Res<object>) => {
        if (promise.result) {
          setResult(promise?.result);
        } else {
          setResult(undefined);
        }
      })
      .catch((e) => {
        console.log(e);
      });
    if (id1 !== id2) {
      SnapshotsApi.fetchSnapshotUpdate(id2, id1)
        .then((promise: Res<object>) => {
          if (promise.result) {
            setDiffData(promise?.result);
          } else {
            setDiffData({});
          }
        })
        .catch((e) => {
          console.log(e);
        });
    } else {
      setDiffData({});
    }
  };
  useEffect(() => {
    fetchAllMeasurements();
  }, []);

  useEffect(() => {
    const checkInterval = setInterval(async () => fetchAllMeasurements(), 1500);
    return () => clearInterval(checkInterval);
  }, []);

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
        selectedMeasurement,
        setSelectedMeasurement,
        trackLatest,
        setTrackLatest,
        workflowGraphElements,
        setWorkflowGraphElements,
        diffData,
        setDiffData,
        result,
        setResult,
        fetchResultsAndDiffData,
        fetchAllMeasurements,
      }}
    >
      {props.children}
    </GraphContext.Provider>
  );
};
