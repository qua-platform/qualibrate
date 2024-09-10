import React from "react";
// eslint-disable-next-line css-modules/no-unused-class
import styles from "./GraphElement.module.scss";
import { PlayIcon } from "../../../../ui-lib/Icons/PlayIcon";
import { classNames } from "../../../../utils/classnames";
import { InputParameter, Parameters, SingleParameter } from "../../../common/Parameters";
import { GraphWorkflow } from "../GraphList";
import { useSelectionContext } from "../../../common/context/SelectionContext";
import { Checkbox } from "@mui/material";
import InputField from "../../../../DEPRECATED_components/common/Input/InputField";
import { ParameterList } from "../../../common/ParameterList";
import { useGraphContext } from "../../context/GraphContext";
import CytoscapeGraph from "../CytoscapeGraph/CytoscapeGraph";
import { GraphLibraryApi } from "../../api/GraphLibraryApi";
import { NodeDTO } from "../../../Nodes/components/NodeElement/NodeElement";
import { useFlexLayoutContext } from "../../../../routing/flexLayout/FlexLayoutContext";

export interface ICalibrationGraphElementProps {
  calibrationGraphKey?: string;
  calibrationGraph: GraphWorkflow;
}

interface TransformedGraph {
  parameters: { [key: string]: string | number };
  nodes: { [key: string]: { parameters: InputParameter } };
}

export const GraphElement: React.FC<ICalibrationGraphElementProps> = ({ calibrationGraphKey, calibrationGraph }) => {
  const { selectedItemName, setSelectedItemName } = useSelectionContext();
  const { workflowGraphElements, setSelectedWorkflowName, allGraphs, setAllGraphs, selectedWorkflowName } = useGraphContext();
  const { openTab } = useFlexLayoutContext();

  const updateParameter = (paramKey: string, newValue: boolean | number | string, workflow?: NodeDTO | GraphWorkflow) => {
    const updatedParameters = {
      ...workflow?.parameters,
      [paramKey]: {
        ...(workflow?.parameters as InputParameter)[paramKey],
        default: newValue,
      },
    };

    if (selectedWorkflowName && allGraphs?.[selectedWorkflowName]) {
      const updatedWorkflow = {
        ...allGraphs[selectedWorkflowName],
        parameters: updatedParameters,
      };

      const updatedCalibrationGraphs = {
        ...allGraphs,
        [selectedWorkflowName]: updatedWorkflow,
      };

      setAllGraphs(updatedCalibrationGraphs);
    }
  };
  const getInputElement = (key: string, parameter: SingleParameter, node?: NodeDTO | GraphWorkflow) => {
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
    const input = allGraphs?.[selectedWorkflowName ?? ""];
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
      const response = await GraphLibraryApi.submitWorkflow(selectedWorkflowName, transformDataForSubmit());
      if (response.isOk) {
        openTab("graph-status");
      }
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
