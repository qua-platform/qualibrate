import React from "react";
import { NodeDTO, NodeMap } from "../../Nodes/components/NodeElement/NodeElement";
import { Parameters, SingleParameter } from "./Parameters";
import { GraphWorkflow } from "../../GraphLibrary/components/GraphList";
import ParameterSelector from "./ParameterSelector";

interface IProps {
  showParameters: boolean;
  mapOfItems?: NodeMap | GraphWorkflow;
  title?: string;
  onChange: (parameterKey: string, newValue: string | number | boolean, isValid: boolean, nodeId?: string | undefined) => void
}

export const ParameterList: React.FC<IProps> = ({ showParameters = false, mapOfItems, onChange }) => {
  const renderInputElement = (key: string, parameter: SingleParameter, node?: NodeDTO | GraphWorkflow) =>
    <ParameterSelector parameterKey={key} parameter={parameter} node={node} onChange={onChange} />;

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
            getInputElement={renderInputElement}
          />
        );
      })}
    </>
  );
};
