import React, { useState } from "react";
import { InputParameter } from "../Parameters/Parameters";
import { Dialog, DialogActions, DialogContent, DialogTitle, Tooltip } from "@mui/material";
import styles from "./ParametersModal.module.scss";
import ParameterSelector from "../Parameters/ParameterSelector";
import { InfoIcon } from "../Icons";
import { classNames } from "../../utils/classnames";

type IProps = {
  show: boolean;
  onClose: () => void;
  onApply: () => void;
  onParamChange: (paramKey: string, newValue: boolean | number | string | string[] | undefined) => void;
  params?: InputParameter;
};

const ParametersModal = ({ show, onClose, onApply, onParamChange, params = {} }: IProps) => {
  const [errors, setErrors] = useState(new Set());

  const handleApply = () => {
    onApply();
    onClose();
  };

  const handleClose = () => {
    Object.entries(params).forEach(([key, parameter]) => onParamChange(key, parameter.default));
    setErrors(new Set());
    onClose();
  };

  const handleSetError = (key: string, isValid: boolean) => {
    const newSet = new Set(errors);

    if (isValid) newSet.delete(key);
    else newSet.add(key);

    setErrors(newSet);
  };

  const handleUpdateParameter = (paramKey: string, newValue: boolean | number | string | string[] | undefined, isValid: boolean) => {
    handleSetError(paramKey, isValid);
    onParamChange(paramKey, newValue);
  };

  return (
    <Dialog classes={{ paper: styles.wrapper }} data-test-id open={show} onClose={handleClose}>
      <DialogTitle className={styles.header}>Configure Parameters</DialogTitle>
      <DialogContent className={styles.body}>
        <button className={styles.close} onClick={handleClose}>
          ×
        </button>
        {Object.entries(params).map(([key, parameter]) => {
          if (parameter.title.toLowerCase() !== "targets name") {
            return (
              <div key={key} className={styles.parameterWrapper} data-testid={`parameter-values-${key}`}>
                <div className={styles.parameterTitleWrapper}>
                  {parameter.title}
                  <div className={styles.descriptionWrapper}>
                    {parameter.description && (
                      <Tooltip title={<div>{parameter.description} </div>} placement="left-start" arrow>
                        <span>
                          <InfoIcon />
                        </span>
                      </Tooltip>
                    )}
                  </div>
                </div>
                <ParameterSelector
                  parameterKey={key}
                  parameter={parameter}
                  onChange={handleUpdateParameter}
                  className={styles.parameterSelector}
                  data-testid="parameter-value"
                />
              </div>
            );
          }
        })}
      </DialogContent>
      <DialogActions className={styles.footer}>
        <button className={classNames(styles.button, styles.secondary)} onClick={handleClose}>
          Close
        </button>
        <button className={classNames(styles.button, styles.primary)} onClick={handleApply} disabled={errors.size > 0}>
          Run
        </button>
      </DialogActions>
    </Dialog>
  );
};

export default ParametersModal;
