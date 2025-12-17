import React, { useCallback, useState } from "react";
import { Checkbox } from "@mui/material";
import { SingleParameter } from "./Parameters";
import { validate } from "./utils";
// eslint-disable-next-line css-modules/no-unused-class
import styles from "./Parameters.module.scss";
import { NodeDTO } from "../../modules/Nodes";
import { GraphWorkflow } from "../../modules/GraphLibrary";
import InputField from "../Input/InputField";
import { classNames } from "../../utils/classnames";
import { ArraySelector } from "../ArraySelector";

const ParameterSelector = ({
  parameterKey,
  parameter,
  node,
  onChange,
}: {
  parameterKey: string
  parameter: SingleParameter
  node?: NodeDTO | GraphWorkflow
  onChange: (paramKey: string, newValue: string | number | boolean | string[], isValid: boolean, nodeId?: string | undefined) => void
}) => {
  const [error, setError] = useState<undefined | string>(undefined);
  const [inputValue, setInputValue] = useState(parameter.default);

  const handleBlur = useCallback(() => {
    const { isValid, error } = validate(parameter, inputValue);

    onChange(parameterKey, inputValue as string, isValid, node?.name);
    setError(error);
  }, [inputValue]);

  const handleChangeBoolean = useCallback(() => {
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
    const renderDefaultField = (
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

    switch (parameter.type) {
      case "boolean":
        return (
          <Checkbox
            checked={inputValue as boolean}
            onClick={handleChangeBoolean}
            inputProps={{ "aria-label": "controlled" }}
            data-testid={`input-field-${parameterKey}`}
          />
        );
      case "array":
        if (parameter.options)
          return (
            <ArraySelector
              key={parameterKey}
              disabled={false}
              value={parameter.default as string[]}
              onChange={(value) => onChange(parameterKey, value, true)}
              options={parameter.options}
            />
          );
        else
          return renderDefaultField;
      default:
        return renderDefaultField;
    }
  }, [inputValue, parameter.default]);


  return <div className={classNames(styles.parameterValueSelector, error && styles.error)}>
    {renderInput()}
    {error && <span className={styles.error}>{error}</span>}
  </div>;
};

export default ParameterSelector;
