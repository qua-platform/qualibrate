import React from "react";
// eslint-disable-next-line css-modules/no-unused-class
import styles from "./ParametersModal.module.scss";
import { SingleParameter } from "../Parameters/Parameters";
import { Tooltip } from "@mui/material";
import { InfoIcon } from "../Icons";
import ParameterSelector from "../Parameters/ParameterSelector";

const ParameterModalSelector = ({
  parameterKey,
  parameter,
  handleUpdateParameter,
}: {
  parameterKey: string;
  parameter: SingleParameter;
  handleUpdateParameter: (paramKey: string, newValue: boolean | number | string | string[] | undefined, isValid: boolean) => void;
}) => {
  return (
    <div className={styles.parameterWrapper} data-testid={`parameter-values-${parameterKey}`}>
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
        parameterKey={parameterKey}
        parameter={parameter}
        onChange={handleUpdateParameter}
        className={styles.parameterSelector}
        data-testid="parameter-value"
      />
    </div>
  );
};

export default ParameterModalSelector;
