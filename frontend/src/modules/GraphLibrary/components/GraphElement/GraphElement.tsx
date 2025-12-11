/**
 * @fileoverview Collapsible graph workflow card with parameters and visualization.
 *
 * Displays a calibration graph with editable parameters, node details, and a
 * Cytoscape preview. Handles parameter transformation for API submission and
 * opens the graph-status panel when execution starts.
 *
 * @see GraphList - Renders multiple GraphElements
 * @see CytoscapeGraph - Embedded graph visualization
 * @see GraphContext - Manages graph selection and execution state
 */
import React, { useState } from "react";
import {useSelector} from "react-redux";
// eslint-disable-next-line css-modules/no-unused-class
import styles from "./GraphElement.module.scss";
import {classNames} from "../../../../utils/classnames";
import {Parameters, SingleParameter} from "../../../common/Parameters/Parameters";
import {ParameterList} from "../../../common/Parameters/ParameterList";
import Graph from "../Graph/Graph";
import {GraphElementErrorWrapper} from "../GraphElementErrorWrapper/GraphElementErrorWrapper";
import BlueButton from "../../../../ui-lib/components/Button/BlueButton";
import {getSelectedWorkflow} from "../../../../stores/GraphStores/GraphLibrary/selectors";
import {setGraphNodeParameter, submitWorkflow} from "../../../../stores/GraphStores/GraphLibrary/actions";
import {useRootDispatch} from "../../../../stores";
import { getSelectedWorkflowName, getWorkflowGraphNodes } from "../../../../stores/GraphStores/GraphCommon/selectors";
import { setSelectedWorkflowName } from "../../../../stores/GraphStores/GraphCommon/actions";
import SubgraphBreadcrumbs from "./components/SubgraphBreadcrumbs";
import ParameterSelector from "../../../common/Parameters/ParameterSelector";

interface ICalibrationGraphElementProps {
  calibrationGraphKey?: string;
}

export const GraphElement: React.FC<ICalibrationGraphElementProps> = ({ calibrationGraphKey }) => {
  const dispatch = useRootDispatch();
  const nodes = useSelector(getWorkflowGraphNodes);
  const selectedWorkflow = useSelector(getSelectedWorkflow);
  const selectedWorkflowName = useSelector(getSelectedWorkflowName);
  const [errors, setErrors] = useState(new Set());

  const handleSubmit = () => dispatch(submitWorkflow());

  const handleSelect = () => {
    dispatch(setSelectedWorkflowName(calibrationGraphKey));
  };

  const handleSetError = (key: string, isValid: boolean) => {
    const newSet = new Set(errors);

    if (isValid)
      newSet.delete(key);
    else
      newSet.add(key);

    setErrors(newSet);
  };

  const onNodeParameterChange = (parameterKey: string, newValue: string | number | boolean, isValid: boolean, nodeId?: string | undefined) => {
    handleSetError(parameterKey, isValid);
    dispatch(setGraphNodeParameter(parameterKey, newValue, nodeId));
  };

  const renderInputElement = (key: string, parameter: SingleParameter) =>
    <ParameterSelector parameterKey={key} parameter={parameter} onChange={onNodeParameterChange} />;

  const show = selectedWorkflowName === calibrationGraphKey;
  return (
    <div
      className={classNames(styles.wrapper, show ? styles.calibrationGraphSelected : "")}
      onClick={handleSelect}
    >
      <div className={styles.upperContainer}>
        <div className={styles.leftContainer}>
          <div>{calibrationGraphKey}</div>
          <div className={styles.runButtonWrapper}>
            <BlueButton disabled={!show || errors.size !== 0} onClick={handleSubmit}>
              Run
            </BlueButton>
          </div>
        </div>
        &nbsp; &nbsp; &nbsp; &nbsp;
        {(show || selectedWorkflow?.description) &&
          <div className={styles.rightContainer}>
            {show && <SubgraphBreadcrumbs />}
            {selectedWorkflow?.description && (
              <div>{selectedWorkflow?.description}</div>
            )}
          </div>
        }
      </div>
      <div className={styles.bottomContainer}>
        <div className={styles.parametersContainer}>
          <GraphElementErrorWrapper />
          <Parameters
            key={calibrationGraphKey}
            show={show}
            showTitle={true}
            currentItem={selectedWorkflow}
            getInputElement={renderInputElement}
          />
          {selectedWorkflow && <ParameterList showParameters={show} mapOfItems={selectedWorkflow.nodes} onChange={onNodeParameterChange} />}
        </div>
        {show && (
          <div className={styles.graphContainer}>
            {!!nodes.length && <Graph />}
          </div>
        )}
      </div>
    </div>
  );
};
