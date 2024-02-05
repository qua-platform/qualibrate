import React, { useState } from "react";
import { WorkflowDTO } from "../types";
import { WorkflowApi } from "../api/WorkflowApi";

export interface WorkflowContextProps {
  getWorkflows: (sort: "ascending" | "descending") => void;
  updateWorkflowById: (id: number) => void;

  workflows: WorkflowDTO[] | null;
  currentWorkflow: WorkflowDTO | null;
}

const WorkflowContext = React.createContext<WorkflowContextProps | any>(null);

interface WorkflowContextProviderProps {
  children: React.ReactNode;
}

export function WorkflowContextProvider(props: WorkflowContextProviderProps): React.ReactElement {
  const { children } = props;

  const [workflows, setWorkflows] = useState<WorkflowDTO[] | null>(null);
  const [currentWorkflow, setCurrentWorkflow] = useState<WorkflowDTO | null>(null);

  //Workflows Actions

  const getWorkflows = async (sort: "ascending" | "descending") => {
    const { result } = await WorkflowApi.getWorkflows(sort);
    if (result) {
      setWorkflows(result.items as WorkflowDTO[]);
    }
  };

  const updateWorkflowById = (id: number) => {
    setCurrentWorkflow((prev) => {
      const workflow = workflows?.find((w) => w.id === id);

      if (!workflow) {
        return prev;
      }

      return workflow;
    });
  };

  return (
    <WorkflowContext.Provider
      value={{
        getWorkflows,
        updateWorkflowById,

        workflows,
        currentWorkflow,
      }}
    >
      {children}
    </WorkflowContext.Provider>
  );
}

export default WorkflowContext;
