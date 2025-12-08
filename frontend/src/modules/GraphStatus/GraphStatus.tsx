/**
 * @fileoverview Graph execution status view with real-time updates.
 *
 * Displays running graph visualization, execution history, and node results.
 * Coordinates state between GraphStatusContext, SnapshotsContext, and WebSocket
 * updates. Handles node selection to fetch and display measurement snapshots.
 *
 * @see GraphStatusContext - Manages measurements and track-latest state
 * @see MeasurementElementGraph - Graph visualization with run status
 * @see MeasurementHistory - Execution history list with track-latest toggle
 */
import React, { useEffect } from "react";
import { useSelector } from "react-redux";
// eslint-disable-next-line css-modules/no-unused-class
import styles from "./GraphStatus.module.scss";
import { Results } from "../../components/Results/Results";
import { MeasurementHistory } from "./components/MeasurementHistory/MeasurementHistory";
import { MeasurementElementGraph } from "./components/MeasurementElementGraph/MeasurementElementGraph";
import { getAllMeasurements } from "../../stores/GraphStores/GraphStatus/selectors";
import { fetchAllMeasurements, setTrackLatest } from "../../stores/GraphStores/GraphStatus/actions";
import { useRootDispatch } from "../../stores";
import { getSelectedNodeNameInWorkflow, getWorkflowGraphNodes } from "../../stores/GraphStores/GraphCommon/selectors";
import { setSelectedNodeNameInWorkflow } from "../../stores/GraphStores/GraphCommon/actions";
import { getLastRunError, getLastRunNodeName } from "../../stores/GraphStores/GraphLibrary/selectors";
import { GlobalParameterStructure } from "../../stores/GraphStores/GraphStatus/GraphStatusStore";
import { getRunStatusGraphName, getRunStatusGraphTotalNodes } from "../../stores/WebSocketStore/selectors";
import { getResult } from "../../stores/SnapshotsStore/selectors";
import { fetchOneSnapshot, setClickedForSnapshotSelection, setDiffData, setResult, setSelectedSnapshotId } from "../../stores/SnapshotsStore/actions";
import { getActivePage } from "../../stores/NavigationStore/selectors";
import { GRAPH_STATUS_KEY } from "../AppRoutes/ModulesRegistry";

export interface Measurement {
  created_at?: string;
  id?: number;
  data?: {
    outcomes: object;
    parameters: GlobalParameterStructure;
    error: object | null;
  };
  metadata?: {
    run_duration?: number;
    name?: string;
    description?: string;
    run_end?: string;
    run_start?: string;
    status?: string;
  };
}

const GraphStatus = () => {
  const dispatch = useRootDispatch();
  const nodes = useSelector(getWorkflowGraphNodes);
  const activePage = useSelector(getActivePage);
  const allMeasurements = useSelector(
    getAllMeasurements,
    (prev?: Measurement[], current?: Measurement[]) => JSON.stringify(prev) === JSON.stringify(current)
  );
  const selectedNodeNameInWorkflow = useSelector(getSelectedNodeNameInWorkflow);
  const runStatusGraphName = useSelector(getRunStatusGraphName);
  const runStatusGraphTotalNodes = useSelector(getRunStatusGraphTotalNodes);
  const lastRunNodeName = useSelector(getLastRunNodeName);
  const lastRunError = useSelector(getLastRunError);
  const result = useSelector(getResult);

  useEffect(() => {
    dispatch(fetchAllMeasurements());
  }, []);

  const getMeasurementId = (measurementName: string, measurements: Measurement[]) => {
    return measurements?.find((measurement) => measurement.metadata?.name === measurementName)?.id;
  };

  /**
   * Ensures measurements are loaded before lookup.
   * Returns fetched measurements or empty array if already loaded.
   */
  const setupAllMeasurements = async () => {
    if (!allMeasurements || allMeasurements.length === 0) {
      return await dispatch(fetchAllMeasurements());
    }
    return [];
  };

  /**
   * Handles node clicks from Cytoscape graph.
   * Fetches measurement snapshot and displays results in right panel.
   * Disables track-latest mode when manually selecting a node.
   */
  const handleOnGraphNodeClick = async (name: string) => {
    const temp = await setupAllMeasurements();
    const measurements = temp && temp.length > 0 ? temp : (allMeasurements ?? []);
    dispatch(setTrackLatest(false));
    dispatch(setSelectedNodeNameInWorkflow(undefined));
    const measurementId = getMeasurementId(name, measurements);
    if (measurementId) {
      dispatch(setSelectedNodeNameInWorkflow(name));
      dispatch(setSelectedSnapshotId(measurementId));
      dispatch(setClickedForSnapshotSelection(true));
      dispatch(fetchOneSnapshot(measurementId, measurementId - 1, true, true));
    } else {
      dispatch(setResult({}));
      dispatch(setDiffData({}));
    }
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.leftContainer}>
        <div className={styles.graphAndHistoryWrapper}>
          {!!nodes.length && activePage === GRAPH_STATUS_KEY && (
            <MeasurementElementGraph
              key={`${runStatusGraphName}-${runStatusGraphTotalNodes}`}
              onNodeClick={handleOnGraphNodeClick}
            />
          )}
          <MeasurementHistory />
        </div>
      </div>
      <div className={styles.rightContainer}>
        <Results
          jsonObject={selectedNodeNameInWorkflow && allMeasurements && allMeasurements.length > 0 && result ? result : {}}
          toggleSwitch={true}
          style={{ height: "100%", flex: "0 1 auto" }}
          errorObject={selectedNodeNameInWorkflow === lastRunNodeName ? lastRunError : undefined}
        />
        {/*<Results title={"QUAM Updates"} jsonObject={diffData} style={{ height: "35%" }} />*/}
      </div>
    </div>
  );
};

export default GraphStatus;
