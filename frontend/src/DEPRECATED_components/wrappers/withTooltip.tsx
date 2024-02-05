import React from "react";
import { Tooltip } from "react-tooltip";
import { v4 as uuidv4 } from "uuid";

interface Props {
  children: React.ReactNode;
  id?: string;
  place?: "top" | "bottom" | "left" | "right";
  effect?: "solid";
  name: string;
  disable?: boolean;
}

const WithTooltip = ({
  children,
  id = uuidv4().split("-").join(""),
  place = "top",
  effect = "solid",
  name = "tooltip",
  disable = false,
}: Props) => {
  if (disable) {
    return <>{children}</>;
  }

  const ElementWithTooltip = React.cloneElement(children, {
    "data-tip": name,
    "data-for": id,
  });

  const tooltipConfig = { place, effect, id };

  return (
    <>
      {ElementWithTooltip}
      <Tooltip {...tooltipConfig} />
    </>
  );
};

export default WithTooltip;
