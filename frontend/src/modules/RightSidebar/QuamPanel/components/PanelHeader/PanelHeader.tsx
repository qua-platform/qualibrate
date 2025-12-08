import React from "react";
// eslint-disable-next-line css-modules/no-unused-class
import styles from "./PanelHeader.module.scss";
import { ToggleSwitch } from "../../../../../components";
import { IdInputField } from "../IdInputField/IdInputField";

type PanelHeaderProps = {
  trackLatest: boolean;
  onToggleTrackLatest: () => void;
  onIdChange: (value: string) => void;
  idValue: string;
  onConfirm: (value: string, first: boolean) => void;
  onFocus?: () => void;
};

export const PanelHeader: React.FC<PanelHeaderProps> = ({ trackLatest, onToggleTrackLatest, onIdChange, idValue, onConfirm, onFocus }) => (
  <div className={styles.panelHeader}>
    <span className={styles.panelHeaderSpan}>QUAM</span>
    <div className={styles.panelHeaderContent}>
      <div className={styles.trackLatestWrapper}>
        <span>Track latest</span>
        <ToggleSwitch isOn={trackLatest} onToggle={onToggleTrackLatest} />
      </div>
    </div>
    <div className={styles.idWrapper}>
      <div>ID:</div>
      <IdInputField onChange={onIdChange} value={idValue} onConfirm={onConfirm} isFirstId={true} disabled={trackLatest} onFocus={onFocus} />
    </div>
  </div>
);
