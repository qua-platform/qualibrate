import React from "react";

import { TargetOffIcon } from "../../ui-lib/Icons/TargetOffIcon";
import { TargetOnIcon } from "../../ui-lib/Icons/TargetOnIcon";

interface Props {
  onClick: () => void;
  isActive: boolean;
}

const TargetButton = ({ onClick, isActive }: Props) => {
  return <button onClick={onClick}>{isActive ? <TargetOnIcon /> : <TargetOffIcon />}</button>;
};

export default TargetButton;
