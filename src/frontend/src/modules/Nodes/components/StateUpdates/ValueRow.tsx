import React, { useRef } from "react";
// eslint-disable-next-line css-modules/no-unused-class
import styles from "./StateUpdates.module.scss";
import { UndoIcon, RightArrowIcon } from "../../../../components";
import { ValueComponent } from "./ValueComponent";
import { EditIcon } from "../../../../components/Icons/EditIcon";
import { Tooltip } from "@mui/material";

export const ValueRow = ({
  oldValue,
  previousValue,
  customValue,
  setCustomValue,
  parameterUpdated,
  setParameterUpdated,
}: {
  oldValue: string | number;
  previousValue: string | number;
  customValue: string | number;
  setCustomValue: (par: string | number) => void;
  parameterUpdated: boolean | undefined;
  setParameterUpdated: (p: boolean) => void;
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCustomValue(event.target.value);
  };

  const handleClickEdit = () => {
    inputRef.current?.focus();
  };

  const handleClickUndo = () => {
    if (inputRef.current) {
      inputRef.current.value = previousValue.toString();
    }
    setCustomValue(previousValue);
  };

  return (
    <>
      <div className={styles.stateUpdateValueOld}>
        <ValueComponent defaultValue={oldValue} />
      </div>
      <div className={styles.stateUpdateRightArrowIconWrapper}>
        <RightArrowIcon />
      </div>
      {!parameterUpdated && (
        <div className={styles.stateUpdateValueNew}>
          <Tooltip title="Edit">
            <div className={styles.stateUpdateValueInputWrapper}>
              <ValueComponent
                inputRef={inputRef}
                defaultValue={customValue}
                onClick={() => {
                  setParameterUpdated(true);
                }}
                onChange={handleChange}
              />
              <div className={styles.stateUpdateEditIcon} onClick={handleClickEdit}>
                <EditIcon width={12} height={12} />
              </div>
            </div>
          </Tooltip>
          {customValue !== previousValue && (
            <div className={styles.stateUpdateUndoIconWrapper} data-testid="undo-icon-wrapper" onClick={handleClickUndo}>
              <UndoIcon />
            </div>
          )}
        </div>
      )}
      {parameterUpdated && (
        <div className={styles.stateUpdateValueNew}>
          <ValueComponent defaultValue={customValue} disabled={parameterUpdated} />
        </div>
      )}
    </>
  );
};
