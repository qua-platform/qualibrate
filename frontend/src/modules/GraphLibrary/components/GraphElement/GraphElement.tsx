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
import {SubgraphBreadcrumbs} from "../../../Graph";
import {Parameters, SingleParameter, ParameterList, ParameterSelector, BlueButton} from "../../../../components";
import {Graph} from "../../../Graph";
import {GraphElementErrorWrapper} from "../GraphElementErrorWrapper/GraphElementErrorWrapper";
import {
  getSelectedWorkflow,
  setSelectedNodeNameInWorkflow,
  setSelectedWorkflowName,
  setSubgraphBack,
  setSubgraphForward,
  submitWorkflow,
  getSelectedNodeNameInWorkflow,
  getSelectedWorkflowName,
  getSubgraphBreadcrumbs,
  setGraphNodeParameter,
} from "../../../../stores/GraphStores/GraphLibrary";
import {useRootDispatch} from "../../../../stores";
import { ParamaterValue } from "../../../../components/Parameters/Parameters";

interface ICalibrationGraphElementProps {
  calibrationGraphKey?: string;
}

export const GraphElement: React.FC<ICalibrationGraphElementProps> = ({ calibrationGraphKey }) => {
  const dispatch = useRootDispatch();
  const selectedWorkflow = useSelector(getSelectedWorkflow);
  const selectedWorkflowName = useSelector(getSelectedWorkflowName);
  const selectedNodeNameInWorkflow = useSelector(getSelectedNodeNameInWorkflow);
  const subgraphBreadcrumbs = useSelector(
    getSubgraphBreadcrumbs,
    // avoid unnecessary re-renders
    { equalityFn: (prev, curr) => prev.join() === curr.join() }
  );
  const [errors, setErrors] = useState(new Set());

  const handleSubmit = () => dispatch(submitWorkflow());
  const handleSelectWorkflow = () => dispatch(setSelectedWorkflowName(calibrationGraphKey));
  const handleSelectNode = (nodeName?: string) => dispatch(setSelectedNodeNameInWorkflow(nodeName));
  const handleSetSubgraphBreadcrumbs = (key: string) => dispatch(setSubgraphForward(key));
  const handleBreadcrumbClick = (index: number) => dispatch(setSubgraphBack(index));

  const handleSetError = (key: string, isValid: boolean) => {
    const newSet = new Set(errors);

    if (isValid)
      newSet.delete(key);
    else
      newSet.add(key);

    setErrors(newSet);
  };

  const onNodeParameterChange = (parameterKey: string, newValue: ParamaterValue, isValid: boolean, nodeId?: string | undefined) => {
    handleSetError(parameterKey, isValid);
    dispatch(setGraphNodeParameter(parameterKey, newValue, nodeId));
  };

  const renderInputElement = (key: string, parameter: SingleParameter) =>
    <ParameterSelector parameterKey={key} parameter={parameter} onChange={onNodeParameterChange} />;

  const show = selectedWorkflowName === calibrationGraphKey;
  return (
    <div
      className={classNames(styles.wrapper, show ? styles.calibrationGraphSelected : "")}
      onClick={handleSelectWorkflow}
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
            {show && <SubgraphBreadcrumbs
              selectedWorkflowName={selectedWorkflowName}
              subgraphBreadcrumbs={subgraphBreadcrumbs}
              onBreadcrumbClick={handleBreadcrumbClick}
            />}
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
            parametersExpanded={true}
          />
          {selectedWorkflow && <ParameterList showParameters={show} mapOfItems={selectedWorkflow.nodes} onChange={onNodeParameterChange} />}
        </div>
        {show && (
          <div className={styles.graphContainer}>
            <Graph
              selectedWorkflowName={calibrationGraphKey}
              selectedNodeNameInWorkflow={selectedNodeNameInWorkflow}
              onNodeClick={handleSelectNode}
              subgraphBreadcrumbs={subgraphBreadcrumbs}
              onSetSubgraphBreadcrumbs={handleSetSubgraphBreadcrumbs}
            />
          </div>
        )}
      </div>
    </div>
  );
};
