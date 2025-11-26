import React from "react";
import { NodeMap } from "../../Nodes/components/NodeElement/NodeElement";
import { Parameters } from "./Parameters";
import { GraphWorkflow } from "../../GraphLibrary/components/GraphList";
import ParameterSelector from "./InputElement";

interface IProps {
  showParameters: boolean;
  mapOfItems?: NodeMap | GraphWorkflow;
  title?: string;
}

export const ParameterList: React.FC<IProps> = ({ showParameters = false, mapOfItems }) => {
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
            getInputElement={(key, parameter, node) => <ParameterSelector parameterKey={key} parameter={parameter} node={node} />}
          />
        );
      })}
    </>
  );
};
