import React, { Dispatch, SetStateAction, useContext, useEffect, useState } from "react";
import noop from "../../../common/helpers";
import { GraphWorkflow } from "../components/GraphList";
import { GraphLibraryApi } from "../api/GraphLibraryApi";
import { ElementDefinition } from "cytoscape";

interface GraphProviderProps {
  children: React.JSX.Element;
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
});

export const useGraphContext = () => useContext<IGraphContext>(GraphContext);

export const GraphContextProvider = (props: GraphProviderProps): React.ReactElement => {
  const [allGraphs, setAllGraphs] = useState<GraphMap | undefined>(undefined);
  const [selectedWorkflow, setSelectedWorkflow] = useState<GraphWorkflow | undefined>(undefined);
  const [selectedWorkflowName, setSelectedWorkflowName] = useState<string | undefined>(undefined);
  const [selectedNodeNameInWorkflow, setSelectedNodeNameInWorkflow] = useState<string | undefined>(undefined);
  const [workflowGraphElements, setWorkflowGraphElements] = useState<ElementDefinition[] | undefined>(undefined);

  const fetchAllCalibrationGraphs = async () => {
    const response = await GraphLibraryApi.fetchAllGraphs();
    if (response.isOk) {
      setAllGraphs(response.result! as GraphMap);
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

  useEffect(() => {
    fetchAllCalibrationGraphs();
  }, []);

  useEffect(() => {
    if (selectedWorkflowName) {
      fetchWorkflowGraph(selectedWorkflowName);
      setSelectedWorkflow(allGraphs?.[selectedWorkflowName]);
    }
  }, [selectedWorkflowName]);

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
      }}
    >
      {props.children}
    </GraphContext.Provider>
  );
};
