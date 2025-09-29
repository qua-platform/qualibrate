import React from "react";
// eslint-disable-next-line css-modules/no-unused-class
import styles from "./GraphStatus.module.scss";
import { GraphStatusContextProvider, Measurement, useGraphStatusContext } from "./context/GraphStatusContext";
import { Results } from "../../../Nodes/components/Results/Results";
import { MeasurementHistory } from "./components/MeasurementHistory/MeasurementHistory";
import { MeasurementElementGraph } from "./components/MeasurementElementGraph/MeasurementElementGraph";
import { SelectionContextProvider, useSelectionContext } from "../../../common/context/SelectionContext";
import { useGraphContext } from "../../context/GraphContext";
import { useSnapshotsContext } from "../../../Snapshots/context/SnapshotsContext";
import { useWebSocketData } from "../../../../contexts/WebSocketContext";

const GraphStatus = () => {
  const { runStatus } = useWebSocketData();

  const { selectedItemName, setSelectedItemName } = useSelectionContext();
  const { workflowGraphElements, lastRunInfo } = useGraphContext();
  const { allMeasurements, fetchAllMeasurements, setTrackLatest } = useGraphStatusContext();
  const { result, fetchOneSnapshot, setResult, setDiffData, setSelectedSnapshotId, setClickedForSnapshotSelection } = useSnapshotsContext();

  const getMeasurementId = (measurementName: string, measurements: Measurement[]) => {
    return measurements?.find((measurement) => measurement.metadata?.name === measurementName)?.id;
  };

  const setupAllMeasurements = async () => {
    if (!allMeasurements || allMeasurements.length === 0) {
      return await fetchAllMeasurements();
    }
    return [];
  };

  const handleOnCytoscapeNodeClick = async (name: string) => {
    const temp = await setupAllMeasurements();
    const measurements = temp && temp.length > 0 ? temp : (allMeasurements ?? []);
    setTrackLatest(false);
    setSelectedItemName(undefined);
    const measurementId = getMeasurementId(name, measurements);
    if (measurementId) {
      setSelectedItemName(name);
      setSelectedSnapshotId(measurementId);
      setClickedForSnapshotSelection(true);
      fetchOneSnapshot(measurementId, measurementId - 1, true, true);
    } else {
      setResult({});
      setDiffData({});
    }
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.leftContainer}>
        <div className={styles.graphAndHistoryWrapper}>
          {workflowGraphElements && (
            <MeasurementElementGraph
              key={`${runStatus?.graph?.name}-${runStatus?.graph?.total_nodes}`}
              workflowGraphElements={workflowGraphElements}
              onCytoscapeNodeClick={handleOnCytoscapeNodeClick}
            />
          )}
          <MeasurementHistory />
        </div>
      </div>
      <div className={styles.rightContainer}>
        <Results
          jsonObject={selectedItemName && allMeasurements && allMeasurements.length > 0 && result ? result : {}}
          toggleSwitch={true}
          pageName={"graph-status"}
          style={{ height: "100%", flex: "0 1 auto" }}
          errorObject={selectedItemName === lastRunInfo?.activeNodeName ? lastRunInfo?.error : undefined}
        />
        {/*<Results title={"QUAM Updates"} jsonObject={diffData} style={{ height: "35%" }} />*/}
      </div>
    </div>
  );
};

export default () => (
  <GraphStatusContextProvider>
    <SelectionContextProvider>
      <GraphStatus />
    </SelectionContextProvider>
  </GraphStatusContextProvider>
);
