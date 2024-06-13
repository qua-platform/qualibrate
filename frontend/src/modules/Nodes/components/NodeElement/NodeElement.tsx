import React from "react";
import styles from "./NodeElement.module.scss";
import BlueButton from "../../../../ui-lib/components/Button/BlueButton";
import InputField from "../../../../DEPRECATED_components/common/Input/InputField";
import { Checkbox, CircularProgress } from "@mui/material";
import { useNodesContext } from "../../context/NodesContext";
import { classNames } from "../../../../utils/classnames";
import { NodesApi } from "../../api/NodesAPI";

export interface SingleParameter {
  default?: string | boolean | number;
  title: string;
  type: string;
  // isFocused?: boolean;
}

export interface InputParameter {
  [key: string]: SingleParameter;
}

export interface NodeDTO {
  name: string;
  title?: string;
  description: string;
  input_parameters: InputParameter;
}

export interface NodeMap {
  [key: string]: NodeDTO;
}

export const NodeElement: React.FC<{ nodeKey: string; node: NodeDTO }> = ({ nodeKey, node }) => {
  const {
    selectedNode,
    setSelectedNode,
    isNodeRunning,
    setResults,
    setRunningNodeInfo,
    setIsNodeRunning,
    setRunningNode,
    allNodes,
    setAllNodes,
  } = useNodesContext();

  const updateParameter = (paramKey: string, newValue: boolean | number | string) => {
    const updatedParameters = {
      ...node.input_parameters,
      [paramKey]: {
        ...node.input_parameters[paramKey],
        default: newValue,
      },
    };
    setAllNodes({ ...allNodes, [nodeKey]: { ...node, input_parameters: updatedParameters } });
  };
  const getInputElement = (key: string, parameter: SingleParameter) => {
    switch (parameter.type) {
      case "boolean":
        return (
          <Checkbox
            checked={parameter.default as boolean}
            onClick={() => updateParameter(key, !parameter.default)}
            inputProps={{ "aria-label": "controlled" }}
          />
        );
      default:
        return (
          <InputField
            placeholder={key}
            value={parameter.default ? parameter.default.toString() : ""}
            onChange={(val) => {
              updateParameter(key, val);
            }}
          />
        );
    }
  };
  const transformInputParameters = (parameters: InputParameter) => {
    return Object.entries(parameters).reduce(
      (acc, [key, parameter]) => {
        acc[key] = parameter.default ?? null;
        return acc;
      },
      {} as { [key: string]: boolean | number | string | null }
    );
  };

  function formatDate(date: Date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");

    return `${year}/${month}/${day} ${hours}:${minutes}:${seconds}`;
  }

  const handleClick = () => {
    NodesApi.submitNodeParameters(node.name, transformInputParameters(node.input_parameters));
    setIsNodeRunning(true);
    setRunningNode(node);
    setRunningNodeInfo({ timestampOfRun: formatDate(new Date()), status: "running" });
    setResults(undefined);
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
          {isNodeRunning && node.name === selectedNode?.name && <CircularProgress />}
          {isNodeRunning && node.name !== selectedNode?.name && (
            <BlueButton className={styles.runButton} disabled={true} onClick={() => handleClick()}>
              Run
            </BlueButton>
          )}
          {!isNodeRunning && (
            <BlueButton className={styles.runButton} disabled={node.name !== selectedNode?.name} onClick={() => handleClick()}>
              Run
            </BlueButton>
          )}
        </div>
      </div>
      <div className={classNames(styles.parametersWrapper, selectedNode?.name !== node.name && styles.nodeNotSelected)}>
        {Object.entries(node.input_parameters).length > 0 && <div className={styles.parameterTitle}>Parameters</div>}
        {Object.entries(node.input_parameters).map(([key, parameter]) => (
          <div key={key} className={styles.parameterValuesWrapper}>
            <div className={styles.parameterLabel}>{parameter.title}:</div>
            <div className={styles.parameterValue}>{getInputElement(key, parameter)}</div>
          </div>
        ))}
      </div>
    </div>
  );
};
