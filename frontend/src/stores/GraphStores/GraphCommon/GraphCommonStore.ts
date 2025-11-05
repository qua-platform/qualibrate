import { createSlice } from "@reduxjs/toolkit";
import { ElementDefinition } from "cytoscape";

interface GraphState {
  selectedNodeNameInWorkflow?: string;
  workflowGraphElements?: ElementDefinition[];
}

const initialCommonGraphState: GraphState = {
  selectedNodeNameInWorkflow: undefined,
  workflowGraphElements: undefined,
};

export const commonGraphSlice = createSlice({
  name: "common",
  initialState: initialCommonGraphState,
  reducers: {
    setSelectedNodeNameInWorkflow: (state, action) => {
      state.selectedNodeNameInWorkflow = action.payload;
    },
    setWorkflowGraphElements: (state, action) => {
      state.workflowGraphElements = action.payload;
    },
  }
});
