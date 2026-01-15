import React from "react";
// eslint-disable-next-line css-modules/no-unused-class
import styles from "./PanelUpdates.module.scss";
import { ToggleSwitch } from "../../../../../components";
import { IdInputField } from "../IdInputField/IdInputField";

type PanelUpdatesProps = {
  previousSnapshot: boolean;
  onTogglePrevious: () => void;
  onSecondIdChange: (value: string) => void;
  idValue: string;
  onConfirm: (value: string, first: boolean) => void;
};

export const PanelUpdates: React.FC<PanelUpdatesProps> = ({ previousSnapshot, onTogglePrevious, onSecondIdChange, idValue, onConfirm }) => (
  <div className={styles.panelUpdates}>
    <div>
      <span className={styles.panelHeaderSpan}>QUAM Updates</span>
    </div>
    <div className={styles.panelHeaderContent}>
      <div className={styles.idWrapper}>
        <div>Compare with:</div>
        <div className={styles.trackLatestWrapper}>
          <span>Prev</span>
          <ToggleSwitch isOn={previousSnapshot} onToggle={onTogglePrevious} />
        </div>
        <div className={styles.idWrapper}>
          <div>ID:</div>
          <IdInputField onChange={onSecondIdChange} value={idValue} onConfirm={onConfirm} disabled={previousSnapshot} />
        </div>
      </div>
    </div>
  </div>
);
