import React, { useContext } from "react";
import { ExperimentSchemaDTO, NodeData, ParametersDTO } from "../../types";
import { RequestStatus } from "../../../../types";
import { AbstractContextWithProjectProvider } from "../../../../utils/contexts/AbstractContextWithProject";
import { NodeApi } from "../api/NodeApi";
import { withActiveProjectContext } from "../../../ActiveProject/ActiveProjectContext";

type actionPayload = {
  [key: string]: string;
};

type RequestsState = {
  logsStatus?: RequestStatus;
  parametersStatus?: RequestStatus;
  nodeInfoStatus?: RequestStatus;
  patchStatus?: RequestStatus;
};
type NodeInfoState = {
  selectedNode?: NodeData;
  expanded?: boolean;
  nodeInfo?: ExperimentSchemaDTO;
  nodeParameters?: any;
  nodeLogs?: string;
  parameters?: ParametersDTO;
};

interface NodeInfoFuncs {
  selectNode: (node: NodeData | undefined) => void;
  editInputParameter: (payload: actionPayload) => void;
  setExpanded: (expanded: boolean) => void;
  refreshData: () => void;
}

type INodeInfoContext = NodeInfoState & NodeInfoFuncs & RequestsState;

const NodeInfoContext = React.createContext<INodeInfoContext | any>(null);

export const useNodeInfoContext = (): INodeInfoContext => useContext<INodeInfoContext>(NodeInfoContext);

class NodeInfoContextContainer extends AbstractContextWithProjectProvider<unknown, NodeInfoState, RequestsState, NodeInfoFuncs> {
  Context = NodeInfoContext;

  selectNode = async (node: NodeData | undefined): Promise<void> => {
    this.setState({ selectedNode: node });
    if (!node) {
      return;
    }

    this._fetchNodeInfo(node);
  };

  refreshData() {
    const { selectedNode } = this.state;
    if (selectedNode) {
      this._fetchNodeInfo(selectedNode);
    }
  }

  _fetchNodeInfo(node: NodeData) {
    this._getNodeInfo(node.name);
    this._getLogs(node.id);
    this._getParameters();
  }

  setExpanded = (expanded: boolean) => {
    this.setState({ expanded });
  };
  editInputParameter = async (payload: actionPayload) => {
    const { selectedNode } = this.state;
    if (!selectedNode) {
      return;
    }

    const { isOk } = await this._fetchWithStatus(
    // const { isOk, result } = await this._fetchWithStatus(
      ({ project_id }) =>
        NodeApi.patchParameters({
          payload,
          parameters_node: selectedNode.id,
          project_id,
          runtime_id: 1,
        }),
      "patchStatus"
    );

    if (isOk) {
      this.refreshData();
    }
  };

  _getLogs = async (node_name: string) => {
    const { isOk, result } = await this._fetchWithStatus(
      ({ project_id }) => NodeApi.getLogs({ node_name, project_id, runtime_id: 1 }),
      "logsStatus"
    );

    this.setState({ nodeLogs: isOk ? result : undefined });
  };

  _getNodeInfo = async (node_class_name: string) => {
    const { isOk, result } = await this._fetchWithStatus(
      ({ project_id }) => NodeApi.getSchema({ project_id, node_class_name, runtime_id: 1 }),
      "nodeInfoStatus"
    );

    this.setState({ nodeInfo: isOk ? result : undefined });
  };

  _getParameters = async () => {
    const { isOk, result } = await this._fetchWithStatus(
      ({ project_id }) => NodeApi.getParameters({ project_id, runtime_id: 1 }),
      "parametersStatus"
    );

    this.setState({ parameters: isOk ? result : undefined });
  };

  protected funcs = {
    selectNode: this.selectNode,
    editInputParameter: this.editInputParameter,
    setExpanded: this.setExpanded,
    refreshData: this.refreshData,
  };
}

export default withActiveProjectContext(NodeInfoContextContainer);
