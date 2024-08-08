import React from "react";
import { NodeDTO, NodeMap } from "../Nodes/components/NodeElement/NodeElement";
import { InputParameter, Parameters, SingleParameter } from "./Parameters";
import { Checkbox } from "@mui/material";
import InputField from "../../DEPRECATED_components/common/Input/InputField";
import { useCalibrationGraphContext } from "../CalibrationGraph/context/CalibrationGraphContext";
import { CalibrationGraphWorkflow } from "../CalibrationGraph/components/CalibrationGraphList";

interface IProps {
  showParameters: boolean;
  mapOfItems?: NodeMap;
}

export const ParameterList: React.FC<IProps> = ({ showParameters = false, mapOfItems }) => {
  const { allCalibrationGraphs, setAllCalibrationGraphs, selectedWorkflowName } = useCalibrationGraphContext();
  const updateParameter = (paramKey: string, newValue: boolean | number | string, node?: NodeDTO | CalibrationGraphWorkflow) => {
    const updatedParameters = {
      ...node?.parameters,
      [paramKey]: {
        ...(node?.parameters as InputParameter)[paramKey],
        default: newValue,
      },
    };
    const changedNode = { ...(node as NodeDTO), parameters: updatedParameters as InputParameter };
    const nodeName = node?.name;
    if (nodeName && selectedWorkflowName && allCalibrationGraphs?.[selectedWorkflowName]) {
      const changedNodeSInWorkflow = {
        ...allCalibrationGraphs[selectedWorkflowName].nodes,
        [nodeName]: changedNode,
      };

      const updatedWorkflow = {
        ...allCalibrationGraphs[selectedWorkflowName],
        nodes: changedNodeSInWorkflow,
      };

      const updatedCalibrationGraphs = {
        ...allCalibrationGraphs,
        [selectedWorkflowName]: updatedWorkflow,
      };

      setAllCalibrationGraphs(updatedCalibrationGraphs);
    }
  };

  const getInputElement = (key: string, parameter: SingleParameter, node?: NodeDTO | CalibrationGraphWorkflow) => {
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
            onChange={(val) => {
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
