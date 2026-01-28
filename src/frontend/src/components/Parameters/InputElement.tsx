import React from "react";
import { Checkbox } from "@mui/material";
import { NodeDTO } from "../../modules/Nodes";
import { GraphWorkflow } from "../../modules/GraphLibrary";
import InputField from "../Input/InputField";
import { SingleParameter } from "./Parameters";
import { useRootDispatch } from "../../stores";
import { getSelectedWorkflowName, getSubgraphBreadcrumbs, setNodeParameter } from "../../stores/GraphStores/GraphLibrary";
import { useSelector } from "react-redux";

const ParameterSelector = ({
  parameterKey,
  parameter,
  node
}: {
  parameterKey: string
  parameter: SingleParameter
  node?: NodeDTO | GraphWorkflow
}) => {
  const dispatch = useRootDispatch();
  const subgraphBreadcrumbs = useSelector(getSubgraphBreadcrumbs);
  const selectedWorkflowName = useSelector(getSelectedWorkflowName);

  const handleChange = (newValue: string | number | boolean | undefined) => {
    dispatch(setNodeParameter({
      paramKey: parameterKey,
      newValue,
      nodeId: node?.name,
      subgraphBreadcrumbs,
      selectedWorkflowName,
    }));
  };

  switch (parameter.type) {
    case "boolean":
      return (
        <Checkbox
          checked={parameter.value as boolean}
          onClick={() => handleChange(!parameter.value)}
          inputProps={{ "aria-label": "controlled" }}
        />
      );
    default:
      return (
        <InputField
          placeholder={parameterKey}
          value={parameter.value ? parameter.value.toString() : ""}
          onChange={handleChange}
        />
      );
  }
};

export default ParameterSelector;
