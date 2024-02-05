import React, { PropsWithChildren } from "react";

import { CloseIcon } from "../../Icons/CloseIcon";
import { classNames } from "../../../utils/classnames";
import styles from "./RightPopupContainer.module.scss";
import BlueButton from "../Button/BlueButton";

interface Props {
  submitText?: string;
  onSubmit?: () => void;
  cancelText?: string;
  onCancel?: () => void;
  onClose?: () => void;
}

const RightPopupContainer = ({ submitText, onSubmit, cancelText, onCancel, onClose, children, ...restProps }: PropsWithChildren<Props>) => {
  const hasButtons = Boolean(onSubmit || onCancel);
  return (
    <div className={styles.container} {...restProps}>
      {onClose && (
        <button onClick={onClose} className={styles.closeBtn}>
          <CloseIcon />
        </button>
      )}
      <div className={classNames(styles.content, !hasButtons && styles.long)}>{children}</div>
      {hasButtons && (
        <div className={styles.bottomButtons}>
          {onCancel && (
            <BlueButton isSecondary onClick={onCancel}>
              {cancelText || "Cancel"}
            </BlueButton>
          )}
          {onSubmit && <BlueButton onClick={onSubmit}>{submitText || "Submit"}</BlueButton>}
        </div>
      )}
    </div>
  );
};

export default RightPopupContainer;
