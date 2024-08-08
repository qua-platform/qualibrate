import React, { Dispatch, SetStateAction, useContext, useEffect, useState } from "react";
import noop from "../../../common/helpers";
import { CalibrationGraphWorkflow } from "../components/CalibrationGraphList";
import { CalibrationsApi } from "../api/CalibrationsAPI";
import { ElementDefinition } from "cytoscape";

interface CalibrationGraphProviderProps {
  children: React.JSX.Element;
}

export interface CalibrationGraphMap {
  [key: string]: CalibrationGraphWorkflow;
}

interface ICalibrationGraphContext {
  allCalibrationGraphs?: CalibrationGraphMap;
  setAllCalibrationGraphs: (array: CalibrationGraphMap | undefined) => void;
  selectedWorkflow?: CalibrationGraphWorkflow;
  setSelectedWorkflow: (workflow: CalibrationGraphWorkflow) => void;
  selectedWorkflowName?: string;
  setSelectedWorkflowName: (workflowName: string | undefined) => void;
  selectedNodeNameInWorkflow?: string;
  setSelectedNodeNameInWorkflow: (nodeName: string | undefined) => void;
  workflowGraphElements?: ElementDefinition[];
  setWorkflowGraphElements: Dispatch<SetStateAction<ElementDefinition[] | undefined>>;
}

const CalibrationGraphContext = React.createContext<ICalibrationGraphContext>({
  allCalibrationGraphs: undefined,
  setAllCalibrationGraphs: noop,

  selectedWorkflow: undefined,
  setSelectedWorkflow: noop,

  selectedWorkflowName: undefined,
  setSelectedWorkflowName: noop,

  selectedNodeNameInWorkflow: undefined,
  setSelectedNodeNameInWorkflow: noop,

  workflowGraphElements: undefined,
  setWorkflowGraphElements: noop,
});

export const useCalibrationGraphContext = () => useContext<ICalibrationGraphContext>(CalibrationGraphContext);

export const CalibrationGraphContextProvider = (props: CalibrationGraphProviderProps): React.ReactElement => {
  const [allCalibrationGraphs, setAllCalibrationGraphs] = useState<CalibrationGraphMap | undefined>(undefined);
  const [selectedWorkflow, setSelectedWorkflow] = useState<CalibrationGraphWorkflow | undefined>(undefined);
  const [selectedWorkflowName, setSelectedWorkflowName] = useState<string | undefined>(undefined);
  const [selectedNodeNameInWorkflow, setSelectedNodeNameInWorkflow] = useState<string | undefined>(undefined);
  const [workflowGraphElements, setWorkflowGraphElements] = useState<ElementDefinition[] | undefined>(undefined);

  const fetchAllCalibrationGraphs = async () => {
    const response = await CalibrationsApi.fetchAllGraphs();
    if (response.isOk) {
      setAllCalibrationGraphs(response.result! as CalibrationGraphMap);
    } else if (response.error) {
      console.log(response.error);
    }
  };
  const fetchWorkflowGraph = async (nodeName: string) => {
    const response = await CalibrationsApi.fetchGraph(nodeName);
    if (response.isOk) {
      setWorkflowGraphElements(response.result! as ElementDefinition[]);
    } else if (response.error) {
      console.log(response.error);
    }
  };
  useEffect(() => {
    fetchAllCalibrationGraphs();
  }, []);

  useEffect(() => {
    if (selectedWorkflowName) {
      fetchWorkflowGraph(selectedWorkflowName);
      setSelectedWorkflow(allCalibrationGraphs?.[selectedWorkflowName]);
    }
  }, [selectedWorkflowName]);

  return (
    <CalibrationGraphContext.Provider
      value={{
        allCalibrationGraphs,
        setAllCalibrationGraphs,
        selectedWorkflow,
        setSelectedWorkflow,
        selectedWorkflowName,
        setSelectedWorkflowName,
        selectedNodeNameInWorkflow,
        setSelectedNodeNameInWorkflow,
        workflowGraphElements,
        setWorkflowGraphElements,
      }}
    >
      {props.children}
    </CalibrationGraphContext.Provider>
  );
};
