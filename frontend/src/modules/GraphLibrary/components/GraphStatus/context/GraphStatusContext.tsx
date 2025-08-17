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

  fetchAllMeasurements: async () => undefined,
});

export const useGraphStatusContext = () => useContext<IGraphContext>(GraphContext);

export const GraphStatusContextProvider = (props: GraphProviderProps): React.ReactElement => {
  const { history } = useWebSocketData();
  const [allMeasurements, setAllMeasurements] = useState<Measurement[] | undefined>(undefined);
  const [workflowGraphElements, setWorkflowGraphElements] = useState<ElementDefinition[] | undefined>(undefined);
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

  return (
    <GraphContext.Provider
      value={{
        allMeasurements,
        setAllMeasurements,
        trackLatest,
        setTrackLatest,
        workflowGraphElements,
        setWorkflowGraphElements,
        fetchAllMeasurements,
      }}
    >
      {props.children}
    </GraphContext.Provider>
  );
};
