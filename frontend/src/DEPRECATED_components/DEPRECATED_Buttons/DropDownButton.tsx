import { ArrowDownIcon } from "../../ui-lib/Icons/ArrowDownIcon";
import DEPRECATEDButton from "./ButtonWrapper";
import { ButtonTypes } from "../../DEPRECATED_common/DEPRECATED_interfaces/ButtonTypes";
import React from "react";

type DropDownButtonProps = {
  label?: string;
};

const DropDownButton: React.FunctionComponent<DropDownButtonProps> = (props) => {
  return (
    <DEPRECATEDButton
      type={ButtonTypes.DROPDOWN}
      icon={<ArrowDownIcon />}
      actionName={props.label || "Select"}
      iconSide="RIGHT"
      {...props}
    />
  );
};

export default DropDownButton;
