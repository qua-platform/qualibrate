import React from "react";
import styles from "./NodeElement.module.scss";
import BlueButton from "../../../ui-lib/components/Button/BlueButton";
import InputField from "../../../DEPRECATED_components/common/Input/InputField";
import { Checkbox } from "@mui/material";
import { useNodesContext } from "../context/NodesContext";
import { classNames } from "../../../utils/classnames";

export interface SingleParameter {
  default?: string | boolean | number;
  title: string;
  type: string;
  // isFocused?: boolean;
}

export interface InputParameter {
  [key: string]: SingleParameter;
}

// export interface InputParameterDTO {
//   name: string;
//   param_type: string;
//   allowed_values?: string[];
//   initial_value?: string | number | string[] | undefined | boolean;
//   isFocused?: boolean;
// }

export interface NodeDTO {
  name: string;
  title?: string;
  description: string;
  input_parameters: InputParameter;
  // input_parameters: InputParameterList;
}

export const NodeElement: React.FC<{ node: NodeDTO; nodeIndex: number }> = ({ node }) => {
  const { selectedNode, setSelectedNode, allNodes, setAllNodes } = useNodesContext();

  const updateParameter = (key: string, newValue: string | number | boolean) => {
    console.log("node.input_parameters", node.input_parameters);
    console.log("newValue", newValue);
    const currentInputParameters = { ...node.input_parameters };
    const singleParameter = currentInputParameters[key];
    currentInputParameters[key] = { ...singleParameter, ...{ default: newValue } };
    setAllNodes(allNodes.map((n) => (n.name === node.name ? { ...n, input_parameters: currentInputParameters } : n)));
  };
  const updateParameter1 = (paramKey: string, newValue: boolean | number | string) => {
    const updatedParameters = {
      ...node.input_parameters,
      [paramKey]: {
        ...node.input_parameters[paramKey],
        default: newValue,
      },
    };

    setAllNodes(allNodes.map((n) => (n.name === node.name ? { ...node, input_parameters: updatedParameters } : n)));
  };
  const getInputElement = (key: string, parameter: SingleParameter) => {
    switch (parameter.type) {
      // case "list[str]":
      //   return (
      //     <Select
      //       labelId="select-label"
      //       id="select"
      //       value={parameter.initial_value}
      //       label={parameter.name}
      //       onChange={(e) => {
      //         const value = e.target.value as string;
      //         updateParameter(parameterIndex, value);
      //       }}
      //     >
      //       {/*{(parameter.allowed_values ?? []).map((allowed_value, index) => (*/}
      //       {/*  <MenuItem key={`${parameter.name}-${allowed_value}-${index}`} value={allowed_value}>*/}
      //       {/*    {allowed_value}*/}
      //       {/*  </MenuItem>*/}
      //       {/*))}*/}
      //     </Select>
      //   );
      // case "number" || "float":
      //   return (
      //     <InputField
      //       placeholder={key}
      //       value={parameter.default?.toString()}
      //       onChange={(val, e) => {
      //         const value = parseFloat(val);
      //         updateParameter(parameterIndex, isNaN(value) ? val : value);
      //       }}
      //     />
      //   );
      // case "float":
      //   return (
      //     <InputField
      //       placeholder={key}
      //       value={parameter.isFocused ? parameter.initial_value?.toString() : Number(parameter.initial_value).toExponential()}
      //       onFocus={() => {
      //         const currentInputParameters = [...node.input_parameters];
      //         currentInputParameters[parameterIndex] = { ...parameter, isFocused: true };
      //         setAllNodes(
      //           allNodes.map((n) =>
      //             n.name === node.name
      //               ? {
      //                   ...n,
      //                   input_parameters: currentInputParameters,
      //                 }
      //               : n
      //           )
      //         );
      //       }}
      //       onBlur={() => {
      //         const currentInputParameters = [...node.input_parameters];
      //         currentInputParameters[parameterIndex] = { ...parameter, isFocused: false };
      //         setAllNodes(
      //           allNodes.map((n) =>
      //             n.name === node.name
      //               ? {
      //                   ...n,
      //                   input_parameters: currentInputParameters,
      //                 }
      //               : n
      //           )
      //         );
      //       }}
      //       onChange={(val, e) => {
      //         const value = parseFloat(val);
      //         updateParameter(parameterIndex, isNaN(value) ? val : value);
      //       }}
      //     />
      //   );
      case "boolean":
        return (
          <Checkbox
            checked={parameter.default as boolean}
            onClick={() => updateParameter1(key, !parameter.default)}
            inputProps={{ "aria-label": "controlled" }}
          />
        );
      default:
        return (
          <InputField
            placeholder={key}
            value={parameter.default?.toString()}
            onChange={(val, e) => {
              updateParameter1(key, val);
            }}
          />
        );
    }
  };

  return (
    <div
      className={classNames(styles.rowWrapper, selectedNode?.name === node.name && styles.nodeSelected)}
      onClick={() => setSelectedNode(node)}
    >
      <div className={styles.row}>
        <div className={styles.titleOrName}>
          <div className={styles.dot}></div>
          {node.title ?? node.name}
        </div>
        <div className={styles.description}>{node.description}</div>
        <div className={styles.runButtonWrapper}>
          <BlueButton className={styles.runButton}>Run</BlueButton>
        </div>
      </div>
      <div className={classNames(styles.parametersWrapper, selectedNode?.name !== node.name && styles.nodeNotSelected)}>
        <div className={styles.parameterTitle}>Parameters</div>
        {Object.entries(node.input_parameters).map(([key, parameter]) => (
          <div key={key} className={styles.parameterValuesWrapper}>
            <div className={styles.parameterLabel}>{key}:</div>
            <div className={styles.parameterValue}>{getInputElement(key, parameter)}</div>
          </div>
        ))}
      </div>
    </div>
  );
};
