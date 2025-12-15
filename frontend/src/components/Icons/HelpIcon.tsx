import React from "react";
import { ACCENT_COLOR_LIGHT } from "../../utils/colors";
import { IconProps } from "./IconProps";

export const HelpIcon: React.FunctionComponent<IconProps> = ({ width = 24, height = 24, color = ACCENT_COLOR_LIGHT }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={width} height={height} viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="10.4" stroke={color} strokeWidth="1.2" />
    <path
      fill={color}
      d="M12.795 14.89h-1.826c-.005-.26-.007-.417-.007-.474 0-.585.098-1.066.293-1.444.196-.377.587-.802 1.175-1.274.587-.471.938-.78 1.052-.927a1.23 1.23 0 00.265-.764c0-.387-.157-.717-.472-.99-.31-.279-.73-.418-1.26-.418-.511 0-.939.144-1.283.432-.343.287-.58.726-.709 1.316l-1.847-.227c.052-.844.415-1.561 1.088-2.15.678-.59 1.566-.886 2.664-.886 1.156 0 2.075.3 2.757.9.683.594 1.025 1.287 1.025 2.08 0 .438-.127.854-.38 1.245-.248.392-.783.925-1.604 1.6-.425.349-.69.63-.795.842-.1.212-.146.592-.136 1.14zm-1.826 2.675v-1.989h2.012v1.99H10.97z"
    />
  </svg>
);
