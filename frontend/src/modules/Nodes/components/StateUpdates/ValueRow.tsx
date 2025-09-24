import React, { useRef } from "react";
// eslint-disable-next-line css-modules/no-unused-class
import styles from "../RunningJob/RunningJob.module.scss";
import { RightArrowIcon } from "../../../../ui-lib/Icons/RightArrowIcon";
import { UndoIcon } from "../../../../ui-lib/Icons/UndoIcon";
import { ValueComponent } from "./ValueComponent"; // export const ValueRow = ({

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
          <ValueComponent
            inputRef={inputRef}
            defaultValue={customValue}
            onClick={() => {
              setParameterUpdated(true);
            }}
            onChange={handleChange}
          />
          {customValue !== previousValue && (
            <div
              className={styles.stateUpdateUndoIconWrapper}
              data-testid="undo-icon-wrapper"
              onClick={() => {
                if (inputRef.current) {
                  inputRef.current.value = previousValue.toString();
                }
                setCustomValue(previousValue);
              }}
            >
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
