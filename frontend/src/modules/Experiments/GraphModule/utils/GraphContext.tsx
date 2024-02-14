import React, { PropsWithChildren, useContext } from "react";
import { RequestStatus } from "../../../../types";
// import { WorkflowApi } from "../../api/WorkflowApi";
import { WorkflowGraphDTO } from "../../types";
import { withActiveProjectContext, WithProjectProps } from "../../../ActiveProject/ActiveProjectContext";
import { AbstractContextWithProjectProvider } from "../../../../utils/contexts/AbstractContextWithProject";

// const DEFAULT_WORKFLOW_FILE = "workflow.py";
interface RequestsState {
  graphDataStatus?: RequestStatus;
}

interface GraphState {
  graphData?: WorkflowGraphDTO;
}

interface GraphFuncs {
  loadGraph: () => void;
}

type Props = PropsWithChildren<WithProjectProps>;

type IGraphContext = GraphState & GraphFuncs & RequestsState;

const GraphContext = React.createContext<IGraphContext | any>(null);

export const useGraphContext = (): IGraphContext => useContext<IGraphContext>(GraphContext);

class GraphContextContainer extends AbstractContextWithProjectProvider<Props, GraphState, RequestsState, GraphFuncs> {
  Context = GraphContext;
  constructor(props: Readonly<Props>) {
    super(props);
    this.state = {};
  }

  loadGraph = async () => {
    // const { result, isOk } = await this._fetchWithStatus(
    //   ({ project_id }) =>
    //     WorkflowApi.getWorkflowGraph({
    //       workflow_path: DEFAULT_WORKFLOW_FILE,
    //       runtimeId: 1,
    //       project_id,
    //     }),
    //   "graphDataStatus"
    // );
    //
    // this.setState({ graphData: isOk ? result : undefined });
    // this.setState({ graphData: undefined });
  };

  protected funcs = {
    loadGraph: this.loadGraph,
  };
}

export default withActiveProjectContext(GraphContextContainer);
