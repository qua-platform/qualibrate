import React from "react";
// eslint-disable-next-line css-modules/no-unused-class
import styles from "../CalibrationGraphElement/CalibrationGraphElement.module.scss";
import { PlayIcon } from "../../../../ui-lib/Icons/PlayIcon";
import { classNames } from "../../../../utils/classnames";
import { InputParameter, Parameters, SingleParameter } from "../../../common/Parameters";
import { CalibrationGraphWorkflow } from "../CalibrationGraphList";
import { useSelectionContext } from "../../../common/context/SelectionContext";
import { Checkbox } from "@mui/material";
import InputField from "../../../../DEPRECATED_components/common/Input/InputField";
import { ParameterList } from "../../../common/ParameterList";
import { useCalibrationGraphContext } from "../../context/CalibrationGraphContext";
import CytoscapeGraph from "../CytoscapeGraph/CytoscapeGraph";
import { CalibrationsApi } from "../../api/CalibrationsAPI";
import { NodeDTO } from "../../../Nodes/components/NodeElement/NodeElement";

export interface ICalibrationGraphElementProps {
  calibrationGraphKey?: string;
  calibrationGraph: CalibrationGraphWorkflow;
}

interface TransformedGraph {
  parameters: { [key: string]: string | number };
  nodes: { [key: string]: { parameters: InputParameter } };
}

export const CalibrationGraphElement: React.FC<ICalibrationGraphElementProps> = ({ calibrationGraphKey, calibrationGraph }) => {
  const { selectedItemName, setSelectedItemName } = useSelectionContext();
  const { workflowGraphElements, setSelectedWorkflowName, allCalibrationGraphs, setAllCalibrationGraphs, selectedWorkflowName } =
    useCalibrationGraphContext();

  const updateParameter = (paramKey: string, newValue: boolean | number | string, workflow?: NodeDTO | CalibrationGraphWorkflow) => {
    const updatedParameters = {
      ...workflow?.parameters,
      [paramKey]: {
        ...(workflow?.parameters as InputParameter)[paramKey],
        default: newValue,
      },
    };

    if (selectedWorkflowName && allCalibrationGraphs?.[selectedWorkflowName]) {
      const updatedWorkflow = {
        ...allCalibrationGraphs[selectedWorkflowName],
        parameters: updatedParameters,
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
            // onClick={() => updateParameter(key, !parameter.default, node)}
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
  const transformDataForSubmit = () => {
    const input = allCalibrationGraphs?.[selectedWorkflowName ?? ""];
    const workflowParameters = input?.parameters;
    const transformParameters = (params?: InputParameter) => {
      let transformedParams = {};
      for (const key in params) {
        transformedParams = { ...transformedParams, [key]: params[key].default };
      }
      return transformedParams;
    };

    const transformedGraph: TransformedGraph = {
      parameters: transformParameters(workflowParameters),
      nodes: {},
    };

    for (const nodeKey in input?.nodes) {
      const node = input?.nodes[nodeKey];
      transformedGraph.nodes[nodeKey] = {
        parameters: transformParameters(node.parameters),
      };
    }

    return transformedGraph;
  };

  const handleSubmit = async () => {
    if (selectedWorkflowName) {
      CalibrationsApi.submitWorkflow(selectedWorkflowName, transformDataForSubmit());
    }
  };

  const show = selectedItemName === calibrationGraphKey;
  return (
    <div
      className={classNames(styles.wrapper, show ? styles.calibrationGraphSelected : "")}
      onClick={() => {
        setSelectedItemName(calibrationGraphKey);
        setSelectedWorkflowName(calibrationGraphKey);
      }}
    >
      <div className={styles.upperContainer}>
        <div className={styles.leftContainer}>
          <div className={styles.iconWrapper}>
            <div onClick={handleSubmit}>
              <PlayIcon />
            </div>
          </div>
          <div className={styles.titleWrapper}>{calibrationGraphKey}</div>
        </div>
        <div className={styles.rightContainer}>
          <div>{calibrationGraph?.description}</div>
        </div>
      </div>
      <div className={styles.bottomContainer}>
        <div className={styles.parametersContainer}>
          <Parameters
            key={calibrationGraphKey}
            show={show}
            showTitle={true}
            currentItem={calibrationGraph}
            getInputElement={getInputElement}
          />
          <ParameterList showParameters={show} mapOfItems={calibrationGraph.nodes} />
        </div>
        <div className={styles.graphContainer}>{show && workflowGraphElements && <CytoscapeGraph elements={workflowGraphElements} />}</div>
      </div>
    </div>
  );
};
