import React from "react";
import { NodeDTO, NodeMap } from "../../modules/Nodes";
import { GraphWorkflow } from "../../modules/GraphLibrary";
import { ParamaterValue, Parameters, SingleParameter } from "./Parameters";
import ParameterSelector from "./ParameterSelector";

interface IProps {
  showParameters: boolean;
  mapOfItems?: NodeMap | GraphWorkflow;
  title?: string;
  onChange: (parameterKey: string, newValue: ParamaterValue, isValid: boolean, nodeId?: string | undefined) => void;
}

export const ParameterList: React.FC<IProps> = ({ showParameters = false, mapOfItems, onChange }) => {
  const renderInputElement = (key: string, parameter: SingleParameter, node?: NodeDTO | GraphWorkflow) => (
    <ParameterSelector
      parameterKey={key}
      parameter={parameter}
      onChange={(paramKey, newValue, isValid) => onChange(paramKey, newValue, isValid, node?.name)}
    />
  );

  return (
    <>
      {Object.entries(mapOfItems ?? {}).map(([key, node]) => {
        return (
          <Parameters
            key={key}
            show={showParameters}
            showTitle={true}
            title={node.name}
            params={node?.parameters}
            getInputElement={(key, parameter) => renderInputElement(key, parameter, node)}
          />
        );
      })}
    </>
  );
};
