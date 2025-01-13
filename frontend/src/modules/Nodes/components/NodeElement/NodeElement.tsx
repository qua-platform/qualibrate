import React from "react";
// eslint-disable-next-line css-modules/no-unused-class
import styles from "./NodeElement.module.scss";
import { Checkbox, CircularProgress } from "@mui/material";
import { ErrorWithDetails, useNodesContext } from "../../context/NodesContext";
import { classNames } from "../../../../utils/classnames";
import { InputParameter, Parameters, SingleParameter } from "../../../common/Parameters/Parameters";
import { useSelectionContext } from "../../../common/context/SelectionContext";
import { ErrorResponseWrapper } from "../../../common/Error/ErrorResponseWrapper";
import InputField from "../../../../common/ui-components/common/Input/InputField";
import BlueButton from "../../../../ui-lib/components/Button/BlueButton";
import { NodesApi } from "../../api/NodesAPI";

export interface NodeDTO {
  name: string;
  title?: string;
  description: string;
  parameters?: InputParameter;
  nodes?: InputParameter;
}

export interface NodeMap {
  [key: string]: NodeDTO;
}

export const NodeElement: React.FC<{ nodeKey: string; node: NodeDTO }> = ({ nodeKey, node }) => {
  const { selectedItemName, setSelectedItemName } = useSelectionContext();
  const {
    isNodeRunning,
    setRunningNodeInfo,
    setSubmitNodeResponseError,
    submitNodeResponseError,
    setIsNodeRunning,
    setRunningNode,
    allNodes,
    setAllNodes,
    setIsAllStatusesUpdated,
    setUpdateAllButtonPressed,
  } = useNodesContext();

  const updateParameter = (paramKey: string, newValue: boolean | number | string) => {
    const updatedParameters = {
      ...node.parameters,
      [paramKey]: {
        ...(node.parameters as InputParameter)[paramKey],
        default: newValue,
      },
    };
    setAllNodes({ ...allNodes, [nodeKey]: { ...node, parameters: updatedParameters } });
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
            onChange={(val: boolean | number | string) => {
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

  const handleClick = async () => {
    setUpdateAllButtonPressed(false);
    setIsNodeRunning(true);
    setIsAllStatusesUpdated(false);
    setRunningNode(node);
    setSubmitNodeResponseError(undefined);
    const result = await NodesApi.submitNodeParameters(node.name, transformInputParameters(node.parameters as InputParameter));
    if (result.isOk) {
      setRunningNodeInfo({ timestampOfRun: formatDate(new Date()), status: "running" });
    } else {
      const errorWithDetails = result.error as ErrorWithDetails;
      setSubmitNodeResponseError({
        nodeName: node.name,
        name: `${errorWithDetails.detail[0].type ?? "Error msg"}: `,
        msg: errorWithDetails.detail[0].msg,
      });
      setRunningNodeInfo({
        timestampOfRun: formatDate(new Date()),
        status: "error",
      });
    }
  };

  const insertSpaces = (str: string, interval = 40) => {
    let result = "";
    for (let i = 0; i < str.length; i += interval) {
      result += str.slice(i, i + interval) + " ";
    }
    return result.trim();
  };

  return (
    <div
      className={classNames(styles.rowWrapper, selectedItemName === node.name && styles.nodeSelected)}
      onClick={() => {
        setSelectedItemName(node.name);
      }}
    >
      <div className={styles.row}>
        <div className={styles.titleOrNameWrapper}>
          <div className={styles.titleOrName}>{insertSpaces(node.title ?? node.name)}</div>
        </div>
        <div className={styles.descriptionWrapper}>
          <div className={styles.description}>
            <div className={styles.descriptionText}>{node.description}</div>
          </div>
        </div>
        <div className={styles.dotWrapper}>
          <div>
            <div className={classNames(styles.dot, selectedItemName === node.name && styles.dotSelected)} />
          </div>
        </div>
        {isNodeRunning && node.name === selectedItemName && <CircularProgress />}
        {isNodeRunning && node.name !== selectedItemName && (
          <BlueButton disabled={true} onClick={() => handleClick()}>
            Run
          </BlueButton>
        )}
        {!isNodeRunning && node.name === selectedItemName && (
          <BlueButton disabled={node.name !== selectedItemName} onClick={() => handleClick()}>
            Run
          </BlueButton>
        )}
      </div>
      {node.name === selectedItemName && node.name === submitNodeResponseError?.nodeName && (
        <ErrorResponseWrapper error={submitNodeResponseError} />
      )}
      {Object.keys(node?.parameters ?? {}).length > 0 && (
        <Parameters
          parametersExpanded={true}
          showTitle={true}
          key={node.name}
          show={selectedItemName === node.name}
          currentItem={node}
          getInputElement={getInputElement}
        />
      )}
    </div>
  );
};
