import React, { useCallback, useEffect } from "react";

// eslint-disable-next-line css-modules/no-unused-class
import styles from "../RunningJob/RunningJob.module.scss";
import { Tooltip } from "@mui/material";

export const ValueComponent = ({
  inputRef,
  defaultValue,
  disabled,
  onClick,
  onChange,
}: {
  inputRef?: React.RefObject<HTMLInputElement>;
  defaultValue: string | number;
  disabled?: boolean;
  onClick?: () => void;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) => {
  const adjustWidth = useCallback(() => {
    if (inputRef?.current) {
      const value = defaultValue.toString() || "";
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      if (context) {
        context.font = getComputedStyle(inputRef.current).font;
        const textWidth = context.measureText(value).width;
        inputRef.current.style.width = `${Math.ceil(textWidth)}px`;
      }
    }
  }, [defaultValue]);

  useEffect(() => {
    adjustWidth();
  }, [defaultValue, adjustWidth]);

  if (!onClick) {
    return (
      <div className={styles.valueContainer} data-testid="value-container">
        {defaultValue}
      </div>
    );
  }

  return (
    <>
      <Tooltip title="Edit">
        <input
          ref={inputRef}
          className={disabled ? styles.valueContainerDisabled : styles.valueContainerEditable}
          data-testid="value-input"
          disabled={disabled}
          onBlur={(e) => {
            onChange && onChange(e);
          }}
          defaultValue={defaultValue}
        />
      </Tooltip>
    </>
  );
};
