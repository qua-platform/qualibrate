import { ExperimentSchemaDTO, ParametersDTO, WorkflowGraphDTO } from "../../types";
import { NodesStatusMap } from "../../../MQTT/utils/utils";
import { ElementDefinition } from "cytoscape";

export const getGraphElements = (data: WorkflowGraphDTO | undefined, nodeStatusesMap: NodesStatusMap): ElementDefinition[] => {
  if (!data || !data.graph) {
    return [];
  }
  const { nodes, edges } = data.graph.elements;

  const newNodes = [...nodes].map((el) => ({
    classes: nodeStatusesMap[el.data.id]?.style || "",
    data: {
      ...el.data,
      label: el.data.name,
    },
    style: {
      "background-image": getNodeIcon(data.icons, el.data.name),
    },
  }));

  return [...newNodes, ...edges];
};

export const getNodeIcon = (
  icons: {
    [key: string]: string;
  },
  nodeName: string
) => {
  const RESERVE_ICONS_PATH = "/assets/";

  const iconName = icons[nodeName];
  return RESERVE_ICONS_PATH + iconName;
};

const _getResolvedInput = (parameterName: string, graphData?: WorkflowGraphDTO, nodeId?: string): string => {
  if (!graphData || !nodeId) {
    return "";
  }
  try {
    return graphData.resolved_inputs[nodeId][parameterName];
  } catch (error) {
    return "";
  }
};
export function extractNodeParameters(nodeInfo?: ExperimentSchemaDTO, graphData?: WorkflowGraphDTO, parameters?: ParametersDTO) {
  if (!nodeInfo) {
    return [[], []];
  }
  const nodeData = graphData?.graph.elements.nodes.find((n) => n.data.name === nodeInfo.name);
  const nodeId = nodeData && nodeData.data.ident;
  const nodeParameters = (parameters && nodeId && parameters[nodeId]) || {};
  const inputsData = nodeInfo.inputs[0];
  const outputsData = nodeInfo.outputs[0];
  const inputKeys = Object.keys(inputsData.description);
  const outputKeys = Object.keys(outputsData.description);

  const inputs = inputKeys.map((key) => {
    const resolvedInput = _getResolvedInput(key, graphData, nodeId);
    const nodeValue = (nodeParameters && nodeParameters[key]) || undefined;
    const value: string = nodeValue ? JSON.stringify(nodeValue) : resolvedInput || "Missing parameter";
    return {
      description: inputsData.description[key],
      units: inputsData.units[key],
      iconId: inputsData.type[key],
      name: key,
      value,
      isReference: resolvedInput && value.indexOf("#/j") === -1,
      isResolvedInput: !!resolvedInput,
    };
  });

  const outputs = outputKeys.map((key) => {
    return {
      description: outputsData.description[key],
      units: outputsData.units[key],
      iconId: outputsData.retention[key],
      name: key,
      value: null,
    };
  });

  return [inputs, outputs];
}
