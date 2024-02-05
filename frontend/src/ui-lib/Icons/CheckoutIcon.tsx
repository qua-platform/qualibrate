import React from "react";
import { IconProps } from "../../DEPRECATED_common/DEPRECATED_interfaces/IconProps";

const CheckoutIcon: React.FC<IconProps> = ({ color = "var(--secondary-blue-button)", height = 30, width = 29 }) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={width} height={height} fill="none" viewBox="0 0 30 29">
      <path
        fill={color}
        fillRule="evenodd"
        d="M12.071 6.797a10.003 10.003 0 005.991 10.396l-3.092 1.49v2.026l5.245-2.87a10.054 10.054 0 004.145-.121v5.124a2 2 0 01-2 2H3.16a2 2 0 01-2-2V8.797a2 2 0 012-2h8.911zM4.64 15.832v1.652l5.766 3.234v-2.06l-4.078-1.984 4.078-2.015v-2.052L4.64 15.832z"
        clipRule="evenodd"
      />
      <path
        fill={color}
        fillRule="evenodd"
        d="M22.04 0a7.958 7.958 0 100 15.916A7.958 7.958 0 0022.04 0zm-5.055 8.958h4.064v4.063h2V8.957h4.064v-2h-4.064V2.894h-2v4.063h-4.064v2z"
        clipRule="evenodd"
      />
    </svg>
  );
};

export default CheckoutIcon;
