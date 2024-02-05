import React from "react";
import { BoltCircleIcon } from "../../../../ui-lib/Icons/BoltCircleIcon";
import { FlowIcon } from "../../../../ui-lib/Icons/FlowIcon";
import { ForeverCircleIcon } from "../../../../ui-lib/Icons/ForeverCircleIcon";
import { StateIcon } from "../../../../ui-lib/Icons/StateIcon";
import { TempCircleIcon } from "../../../../ui-lib/Icons/TempCircleIcon";
import { IconProps } from "../../../../DEPRECATED_common/DEPRECATED_interfaces/IconProps";

export const inputIcons: { [key: number]: React.FC<IconProps> } = {
  1: StateIcon,
  2: FlowIcon,
};

export const outputIcons: { [key: number]: React.FC<IconProps> } = {
  0: BoltCircleIcon,
  1: TempCircleIcon,
  2: ForeverCircleIcon,
};
