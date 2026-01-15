import React, { useEffect } from "react";
import { classNames } from "../../utils/classnames";
// eslint-disable-next-line css-modules/no-unused-class
import styles from "./Parameters.module.scss";
import { NodeDTO } from "../../modules/Nodes";
import { ArrowIcon } from "../Icons/ArrowIcon";
import { GraphWorkflow } from "../../modules/GraphLibrary";
import Tooltip from "@mui/material/Tooltip";
import { InfoIcon } from "../Icons/InfoIcon";
import { useSelector } from "react-redux";
import { getSelectedNodeNameInWorkflow } from "../../stores/GraphStores/GraphLibrary";

interface IProps {
  parametersExpanded?: boolean;
  show: boolean;
  showTitle: boolean;
  title?: string;
  currentItem?: NodeDTO | GraphWorkflow;
  getInputElement: (key: string, parameter: SingleParameter, node?: NodeDTO | GraphWorkflow) => React.JSX.Element;
}

export type ParameterTypes = "boolean" | "number" | "integer" | "array" | "string";
export type ParamaterValue = string | boolean | number | string[];
export type QubitMetadata = { active: boolean; fidelity: number; }
export type QubitMetadataList = Record<string, QubitMetadata>
export interface SingleParameter {
  id?: string;
  name?: string;
  parameters?: InputParameter;
  default?: ParamaterValue;
  items?: { type: string };
  enum?: string[]
  metadata?: QubitMetadataList;
  options?: {
    id: string;
    title: string;
    online: boolean;
    percent: number;
    lastRun: string;
  }[];
  title: string;
  type: ParameterTypes;
  is_targets: boolean;
  description?: string | null;
}

export interface InputParameter {
  [key: string]: SingleParameter;
}

export const Parameters: React.FC<IProps> = ({
  parametersExpanded = false,
  show = false,
  showTitle = true,
  title,
  currentItem,
  getInputElement,
}) => {
  const selectedNodeNameInWorkflow = useSelector(getSelectedNodeNameInWorkflow);
  const [expanded, setExpanded] = React.useState<boolean>(selectedNodeNameInWorkflow === title || parametersExpanded);

  useEffect(() => {
    if (selectedNodeNameInWorkflow === title || parametersExpanded) {
      setExpanded(true);
    } else {
      setExpanded(false);
    }
  }, [selectedNodeNameInWorkflow]);

  return (
    <div className={classNames(styles.parametersWrapper, !show && styles.nodeNotSelected)} data-testid="node-parameters-wrapper">
      {showTitle && Object.entries(currentItem?.parameters ?? {}).length > 0 && (
        <div className={styles.parameterTitle}>
          <div
            className={styles.arrowIconWrapper}
            onClick={() => {
              setExpanded(!expanded);
            }}
          >
            <ArrowIcon options={{ rotationDegree: expanded ? 0 : -90 }} />
          </div>
          {title ?? "Parameters"}
        </div>
      )}
      {expanded &&
        Object.entries(currentItem?.parameters ?? {}).map(([key, parameter]) => {
          if (parameter.title.toLowerCase() !== "targets name") {
            return (
              <div key={key} className={styles.parameterValues} data-testid={`parameter-values-${key}`}>
                <div className={styles.parameterLabel}>{parameter.title}:</div>
                <div className={styles.parameterValue} data-testid="parameter-value">
                  {getInputElement(key, parameter, currentItem)}
                </div>
                <div className={styles.descriptionWrapper}>
                  {parameter.description && (
                    <Tooltip
                      title={<div className={styles.descriptionTooltip}>{parameter.description} </div>}
                      placement="left-start"
                      arrow
                    >
                      <span>
                        <InfoIcon />
                      </span>
                    </Tooltip>
                  )}
                </div>
              </div>
            );
          }
        })}
    </div>
  );
};
