import React from "react";
import { NodeDTO, NodeMap } from "../../modules/Nodes/components/NodeElement/NodeElement";
import { Parameters, SingleParameter } from "./Parameters";
import { GraphWorkflow } from "../../modules/GraphLibrary/components/GraphList";
import ParameterSelector from "./InputElement";

interface IProps {
  showParameters: boolean;
  mapOfItems?: NodeMap | GraphWorkflow;
  title?: string;
}

export const ParameterList: React.FC<IProps> = ({ showParameters = false, mapOfItems }) => {
  const renderInputElement = (key: string, parameter: SingleParameter, node?: NodeDTO | GraphWorkflow) =>
    <ParameterSelector parameterKey={key} parameter={parameter} node={node} />;

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
