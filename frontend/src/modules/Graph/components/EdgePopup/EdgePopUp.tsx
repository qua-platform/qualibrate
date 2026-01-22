import React from "react";
import { Dialog } from "@mui/material";
import styles from "./EdgePopUp.module.scss";

export interface ConditionalEdgePopUpProps {
  open: boolean;
  source: string;
  target: string;
  info?: {
    label?: string;
    content?: string;
  }
  onClose: () => void;
}

const EdgePopUp = (props: ConditionalEdgePopUpProps) => {
  const { source, target, open, info: { label, content } = {}, onClose } = props;

  return (
    <Dialog classes={{ paper: styles.conditionModalWrapper }} data-test-id open={open} onClose={onClose}>
      <div data-testid={"conditional-edge-pop-up-content"} className={styles.conditionModalContent}>
        <div className={styles.conditionModalHeader}>
          <div>
            <div className={styles.conditionModalTitle}>Condition details</div>
            <div className={styles.conditionNodeVisual} id="conditionNodeVisual">
              <div className={styles.conditionModalGraphWrapper}>
                <div className={styles.conditionNodeCircle} />
                <div className={styles.conditionNodeLabel}>{source}</div>
              </div>
              <div className={styles.conditionNodeArrow}>→</div>
              <div className={styles.conditionModalGraphWrapper}>
                <div className={styles.conditionNodeCircle} />
                <div className={styles.conditionNodeLabel}>{target}</div>
              </div>
            </div>
          </div>
          <button className={styles.conditionModalClose} onClick={onClose}>
            ×
          </button>
        </div>
        <div className={styles.conditionModalBody}>
          <div className={styles.conditionModalInputGroup}>
            <label className={styles.conditionModalInputLabel}>Condition Label</label>
            <textarea
              readOnly={true}
              className={styles.conditionModalInputTextarea}
              id="conditionTextarea"
              placeholder="Enter condition label..."
              defaultValue={label}
            />
          </div>
          <div className={styles.conditionModalInputGroup}>
            <label className={styles.conditionModalInputLabel}>Logic</label>
            <textarea
              readOnly={true}
              className={styles.conditionModalInputTextareaLogic}
              id="conditionLogicTextarea"
              placeholder="Enter condition label..."
              defaultValue={content}
            />
          </div>
        </div>
      </div>
    </Dialog>
  );
};

export default EdgePopUp;
