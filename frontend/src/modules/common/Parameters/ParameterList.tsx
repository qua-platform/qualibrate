import React from "react";
import { NodeDTO, NodeMap } from "../../Nodes/components/NodeElement/NodeElement";
import { InputParameter, Parameters, SingleParameter } from "./Parameters";
import { Checkbox } from "@mui/material";
import { useGraphContext } from "../../GraphLibrary/context/GraphContext";
import { GraphWorkflow } from "../../GraphLibrary/components/GraphList";
import InputField from "../../../common/ui-components/common/Input/InputField";

interface IProps {
  showParameters: boolean;
  mapOfItems?: NodeMap;
}

export const ParameterList: React.FC<IProps> = ({ showParameters = false, mapOfItems }) => {
  const { allGraphs, setAllGraphs, selectedWorkflowName } = useGraphContext();
  const updateParameter = (paramKey: string, newValue: boolean | number | string, node?: NodeDTO | GraphWorkflow) => {
    const updatedParameters = {
      ...node?.parameters,
      [paramKey]: {
        ...(node?.parameters as InputParameter)[paramKey],
        default: newValue,
      },
    };
    const changedNode = { ...(node as NodeDTO), parameters: updatedParameters as InputParameter };
    const nodeName = node?.name;
    if (nodeName && selectedWorkflowName && allGraphs?.[selectedWorkflowName]) {
      const changedNodeSInWorkflow = {
        ...allGraphs[selectedWorkflowName].nodes,
        [nodeName]: changedNode,
      };

      const updatedWorkflow = {
        ...allGraphs[selectedWorkflowName],
        nodes: changedNodeSInWorkflow,
      };

      const updatedCalibrationGraphs = {
        ...allGraphs,
        [selectedWorkflowName]: updatedWorkflow,
      };

      setAllGraphs(updatedCalibrationGraphs);
    }
  };

  const getInputElement = (key: string, parameter: SingleParameter, node?: NodeDTO | GraphWorkflow) => {
    switch (parameter.type) {
      case "boolean":
        return (
          <Checkbox
            checked={parameter.default as boolean}
            onClick={() => updateParameter(key, !parameter.default, node)}
            inputProps={{ "aria-label": "controlled" }}
          />
        );
      default:
        return (
          <InputField
            placeholder={key}
            value={parameter.default ? parameter.default.toString() : ""}
            onChange={(val: boolean | number | string) => {
              updateParameter(key, val, node);
            }}
          />
        );
    }
  };
  return (
    <>
      {Object.entries(mapOfItems ?? {}).map(([key, parameter]) => {
        return (
          <Parameters
            key={key}
            show={showParameters}
            showTitle={true}
            title={parameter.name}
            currentItem={parameter}
            getInputElement={getInputElement}
          />
        );
      })}
    </>
  );
};
