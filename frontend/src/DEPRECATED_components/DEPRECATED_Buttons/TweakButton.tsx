import React from "react";
import TweakIcon from "../../ui-lib/Icons/TweakIcon";

interface Props {
  onClick: () => void;
  isActive: boolean;
}

const TweakButton = ({ onClick, isActive }: Props) => {
  return (
    <button onClick={onClick}>
      <TweakIcon isActive={isActive} />
    </button>
  );
};

export default TweakButton;
