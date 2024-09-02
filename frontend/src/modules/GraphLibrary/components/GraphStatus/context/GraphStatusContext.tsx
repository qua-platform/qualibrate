import React, { Dispatch, SetStateAction, useContext, useEffect, useState } from "react";
import { ElementDefinition } from "cytoscape";
import noop from "../../../../../common/helpers";
import { GraphLibraryApi } from "../../../api/GraphLibraryApi";
import { SnapshotsApi } from "../../../../Snapshots/api/SnapshotsApi";
import { Res } from "../../../../../common/interfaces/Api";

interface GraphProviderProps {
  children: React.JSX.Element;
}

export interface MeasurementParameter {
  [key: string]: string | number;
}

export interface Measurement {
  snapshot_idx?: number;
  name?: string;
  description?: string;
  outcomes: object;
  parameters: MeasurementParameter;
  run_start: string;
  run_end: string;
  run_duration: number;
}

interface IGraphContext {
  allMeasurements?: Measurement[];
  setAllMeasurements: (array: Measurement[] | undefined) => void;

  selectedMeasurement?: Measurement;
  setSelectedMeasurement: (measurement: Measurement) => void;

  workflowGraphElements?: ElementDefinition[];
  setWorkflowGraphElements: Dispatch<SetStateAction<ElementDefinition[] | undefined>>;

  diffData: unknown | undefined;
  setDiffData: Dispatch<SetStateAction<object | undefined>>;

  result: unknown | undefined;
  setResult: Dispatch<SetStateAction<object | undefined>>;
  fetchResultsAndDiffData: (snapshotId: number) => void;
}

const GraphContext = React.createContext<IGraphContext>({
  allMeasurements: undefined,
  setAllMeasurements: noop,

  selectedMeasurement: undefined,
  setSelectedMeasurement: noop,

  workflowGraphElements: undefined,
  setWorkflowGraphElements: noop,

  diffData: {},
  setDiffData: () => {},

  result: {},
  setResult: () => {},

  fetchResultsAndDiffData: () => {},
});

export const useGraphStatusContext = () => useContext<IGraphContext>(GraphContext);

export const GraphStatusContextProvider = (props: GraphProviderProps): React.ReactElement => {
  const [allMeasurements, setAllMeasurements] = useState<Measurement[] | undefined>(undefined);
  const [selectedMeasurement, setSelectedMeasurement] = useState<Measurement | undefined>(undefined);
  const [workflowGraphElements, setWorkflowGraphElements] = useState<ElementDefinition[] | undefined>(undefined);
  const [diffData, setDiffData] = useState<unknown | undefined>(undefined);
  const [result, setResult] = useState<unknown | undefined>(undefined);

  const fetchAllMeasurements = async () => {
    const response = await GraphLibraryApi.fetchExecutionHistory();
    if (response.isOk) {
      if (response.result && response.result.items) {
        setAllMeasurements(response.result.items);
        // setAllMeasurements(
        //     response.result.items.filter((item) => {
        //       if (item.snapshot_idx) {
        //         return item;
        //       }
        //     })
        // );
      }
    } else if (response.error) {
      console.log(response.error);
    }
  };

  const fetchResultsAndDiffData = (snapshotId: number) => {
    const id1 = snapshotId.toString();
    const id2 = snapshotId - 1 >= 0 ? (snapshotId - 1).toString() : "0";
    console.log(id1, id2);
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
        workflowGraphElements,
        setWorkflowGraphElements,
        diffData,
        setDiffData,
        result,
        setResult,
        fetchResultsAndDiffData,
      }}
    >
      {props.children}
    </GraphContext.Provider>
  );
};
