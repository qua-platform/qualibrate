import React from "react";
import { Checkbox } from "@mui/material";
import { NodeDTO } from "../../Nodes/components/NodeElement/NodeElement";
import { GraphWorkflow } from "../../GraphLibrary/components/GraphList";
import InputField from "../../../common/ui-components/common/Input/InputField";
import { SingleParameter } from "./Parameters";

const ParameterSelector = ({
  parameterKey,
  parameter,
  node,
  onChange,
}: {
  parameterKey: string
  parameter: SingleParameter
  node?: NodeDTO | GraphWorkflow
  onChange: (paramKey: string, newValue: string | number | boolean, nodeId?: string | undefined) => void
}) => {
  const handleChange = (newValue: string | number | boolean) => {
    onChange(parameterKey, newValue, node?.name);
  };

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
   *
   * **IMPROVEMENT NEEDED: Type Validation**:
   * No client-side validation for parameter types. Users can enter invalid values
   * (e.g., text in number field) and only discover errors after submission.
   */
  switch (parameter.type) {
    case "boolean":
      return (
        <Checkbox
          checked={parameter.default as boolean}
          onClick={() => handleChange(!parameter.default)}
          inputProps={{ "aria-label": "controlled" }}
        />
      );
    default:
      return (
        <InputField
          placeholder={parameterKey}
          value={parameter.default ? parameter.default.toString() : ""}
          onChange={handleChange}
        />
      );
  }
};

export default ParameterSelector;
