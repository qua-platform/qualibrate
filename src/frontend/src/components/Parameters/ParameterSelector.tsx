import React, { useCallback, useState } from "react";
import { Checkbox } from "@mui/material";
import { ParamaterValue, SingleParameter } from "./Parameters";
import { getParameterType, validate } from "./utils";
// eslint-disable-next-line css-modules/no-unused-class
import styles from "./Parameters.module.scss";
import { NodeDTO } from "../../modules/Nodes";
import { GraphWorkflow } from "../../modules/GraphLibrary";
import InputField from "../Input/InputField";
import { classNames } from "../../utils/classnames";
import { EnumSelector, QubitsSelector } from "../ArraySelector";

const ParameterSelector = ({
  parameterKey,
  parameter,
  node,
  onChange,
}: {
  parameterKey: string
  parameter: SingleParameter
  node?: NodeDTO | GraphWorkflow
  onChange: (paramKey: string, newValue: ParamaterValue, isValid: boolean, nodeId?: string | undefined) => void
}) => {
  const [error, setError] = useState<undefined | string>(undefined);
  const [inputValue, setInputValue] = useState<ParamaterValue | undefined>(parameter.value);

  const handleBlur = useCallback((value?: ParamaterValue) => {
    const { isValid, error } = validate(parameter, value);

    onChange(parameterKey, value as string, isValid, node?.name);
    setError(error);
  }, [inputValue]);

  const handleChangeBoolean = useCallback(() => {
    setInputValue(!inputValue);
    handleBlur(!inputValue);
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
    const { type } = getParameterType(parameter);

    if (type === "boolean")
      return (
        <Checkbox
          checked={inputValue as boolean}
          onClick={handleChangeBoolean}
          inputProps={{ "aria-label": "controlled" }}
          data-testid={`input-field-${parameterKey}`}
        />
      );

    if (parameter.enum)
      return (
        <EnumSelector
          key={parameterKey}
          disabled={false}
          value={Array.isArray(inputValue) ? inputValue : (inputValue as string || "").split(",")}
          onChange={(value) => {
            setInputValue(value);
            handleBlur(value);
          }}
          options={parameter.enum}
        />
      );

    if (parameterKey === "qubits" && parameter.metadata)
      return (
        <QubitsSelector
          key={parameterKey}
          disabled={false}
          value={inputValue as string[]}
          onChange={(value) => {
            setInputValue(value);
            handleBlur(value);
          }}
          metadata={parameter.metadata}
        />
      );

    return (
      <InputField
        placeholder={parameterKey}
        value={inputValue as string || undefined}
        onChange={(value) => setInputValue(value || undefined)}
        onBlur={() => handleBlur(inputValue)}
        className={styles.input}
        type={["number", "integer"].includes(type) ? "number" : "string"}
        data-testid={`input-field-${parameterKey}`}
      />
    );
  }, [inputValue, parameter.default]);


  return <div className={classNames(styles.parameterValueSelector, error && styles.error)}>
    {renderInput()}
    {error && <span className={styles.error}>{error}</span>}
  </div>;
};

export default ParameterSelector;
