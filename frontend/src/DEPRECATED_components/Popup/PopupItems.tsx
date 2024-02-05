import React from "react";

interface Props {
  children: JSX.Element | JSX.Element[];
  className?: string;
}
const PopupItems = ({ children, className }: Props) => {
  return <div className={className}>{children}</div>;
};

export default PopupItems;
