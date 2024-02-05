import React from "react";
import BlueButton from "../../ui-lib/components/Button/BlueButton";

const CancelButton = (props: React.ButtonHTMLAttributes<HTMLButtonElement>) => {
  return <BlueButton {...props}>Cancel</BlueButton>;
};

export default CancelButton;
