import React from "react";
import styles from "./ParametersViewer.module.scss";
import { ParameterStructure } from "../../stores/SnapshotsStore/api/SnapshotsApi";
import { formatNames } from "../../utils";
import { formatParamValue } from "../../modules/Data/components/DataRightPanel/DataRightPanel";

export const ParametersViewer = ({ data = {} }: { data: ParameterStructure; }) => Object.entries(data).map(([key, value]) => (
  <div key={key} className={styles.param}>
    <div className={styles.paramLabel}>{formatNames(key)}</div>
    <div className={styles.paramValue}>{formatParamValue(key, value)}</div>
  </div>
));
