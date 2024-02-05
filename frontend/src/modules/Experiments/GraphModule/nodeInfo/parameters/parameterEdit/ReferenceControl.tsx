import React from "react";
import BlueButton from "../../../../../../ui-lib/components/Button/BlueButton";
import { useEditParameterContext } from "../EditParameterContext";
import styles from "./styles/ReferenceModule.module.scss";
import cyKeys from "../../../../../../utils/cyKeys";

const ReferenceControl = () => {
  const { applyReference, selectParameter } = useEditParameterContext();

  return (
    <div className={styles.control}>
      <BlueButton className={styles.controlButton} onClick={() => selectParameter(null)}>
        Cancel
      </BlueButton>
      <BlueButton className={styles.controlButton} data-cy={cyKeys.experiment.nodeInfo.edit.APPLY} onClick={applyReference}>
        Apply
      </BlueButton>
    </div>
  );
};

export default ReferenceControl;
