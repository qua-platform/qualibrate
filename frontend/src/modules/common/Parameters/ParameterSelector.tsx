import React, { useCallback, useState } from "react";
import { Checkbox } from "@mui/material";
import { NodeDTO } from "../../Nodes/components/NodeElement/NodeElement";
import { GraphWorkflow } from "../../GraphLibrary/components/GraphList";
import InputField from "../../../common/ui-components/common/Input/InputField";
import { SingleParameter } from "./Parameters";
import { validate } from "./utils";
// eslint-disable-next-line css-modules/no-unused-class
import styles from "./Parameters.module.scss";
import { classNames } from "../../../utils/classnames";

const ParameterSelector = ({
  parameterKey,
  parameter,
  node,
  onChange,
}: {
  parameterKey: string
  parameter: SingleParameter
  node?: NodeDTO | GraphWorkflow
  onChange: (paramKey: string, newValue: string | number | boolean, isValid: boolean, nodeId?: string | undefined) => void
}) => {
  const [error, setError] = useState<undefined | string>(undefined);
  const [inputValue, setInputValue] = useState(parameter.default);

  const handleBlur = useCallback(() => {
    const { isValid, error } = validate(parameter, inputValue);

    onChange(parameterKey, inputValue as string, isValid, node?.name);
    setError(error);
  }, [inputValue]);

  const handleChangeBooelan = useCallback(() => {
    setInputValue(!inputValue);
    handleBlur();
  }, [handleBlur]);

  /**
   * Render appropriate input component based on parameter type.
   *
   * Creates type-specific input elements for parameter editing. Currently
   * supports boolean (Checkbox) and all other types (InputField with string coercion).
   *
   * @remarks
   * **FRAGILE: Limited Type Support**:
   * Only boolean has dedicated UI - all other types (number, string, etc.) use
   * generic InputField with string coercion. Number validation happens at submission
   * time on backend, not during input. Consider adding number input with validation.
   */
  const renderInput = useCallback(() => {
    switch (parameter.type) {
      case "boolean":
        return (
          <Checkbox
            checked={inputValue as boolean}
            onClick={handleChangeBooelan}
            inputProps={{ "aria-label": "controlled" }}
            data-testid={`input-field-${parameterKey}`}
          />
        );
      default:
        return (
          <InputField
            placeholder={parameterKey}
            value={inputValue as string}
            onChange={setInputValue}
            onBlur={handleBlur}
            className={styles.input}
            type={["number", "integer"].includes(parameter.type) ? "number" : "string"}
            data-testid={`input-field-${parameterKey}`}
          />
        );
    }
  }, [inputValue, parameter.default]);


  return <div className={classNames(styles.parameterValueSelector, error && styles.error)}>
    {renderInput()}
    {error && <span className={styles.error}>{error}</span>}
  </div>;
};

export default ParameterSelector;
