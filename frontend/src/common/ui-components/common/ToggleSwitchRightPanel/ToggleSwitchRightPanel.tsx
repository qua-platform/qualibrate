import React from "react";
import styles from "./ToggleSwitchRightPanel.module.scss";

type ToggleSwitchProps = {
  isOn: boolean;
  onToggle: () => void;
};

export const ToggleSwitchRightPanel: React.FC<ToggleSwitchProps> = ({ isOn, onToggle }) => (
  <div className={`${styles.toggleSwitch} ${isOn ? styles.toggleOn : styles.toggleOff}`} onClick={onToggle}>
    <div className={`${styles.toggleKnob} ${isOn ? styles.toggleOn : styles.toggleOff}`} />
  </div>
);
