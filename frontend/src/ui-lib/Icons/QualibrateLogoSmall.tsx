import React from "react";
import { IconProps } from "../../common/interfaces/IconProps";

const QUAlibrateLogoSmallIcon: React.FunctionComponent<IconProps> = ({ width = 26, height = 23 }) => {
  return (
    <img
      src="/assets/QM_Full QM_White symbol_CMYK.svg"
      width={width}
      height={height}
      alt="Qualibrate Logo"
    />
  );
};

export default QUAlibrateLogoSmallIcon;
