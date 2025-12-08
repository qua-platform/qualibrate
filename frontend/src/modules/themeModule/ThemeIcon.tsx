import React, { useEffect, useRef } from "react";
import { GREY_FONT } from "../../utils/colors";
import { IconProps } from "../../components";

function ThemeIcon({
  isLight = true,
  color = GREY_FONT,
  height = 24,
  width = 24,
}: IconProps & {
  isLight: boolean;
}): React.ReactElement {
  const toLightRef = useRef<SVGAnimateElement | null>(null);
  const toDarkRef = useRef<SVGAnimateElement | null>(null);
  useEffect(() => {
    const ref = isLight ? toLightRef : toDarkRef;
    ref.current?.beginElement();
  }, [isLight]);
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={height} height={width} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10.4" stroke={color} strokeWidth="1.2" />
      {isLight ? (
        <g>
          <circle cx="12" cy="12" r="3.6" fill={color} />
          <circle cx="12" cy="6" r="1" fill={color} />
          <circle cx="12" cy="18" r="1" fill={color} />
          <circle cx="17.157" cy="9" r="1" fill={color} transform="rotate(60 17.157 9)" />
          <circle cx="6.766" cy="15" r="1" fill={color} transform="rotate(60 6.766 15)" />
          <circle cx="17.159" cy="15" r="1" fill={color} transform="rotate(120 17.159 15)" />
          <circle cx="6.768" cy="9" r="1" fill={color} transform="rotate(120 6.768 9)" />
        </g>
      ) : (
        <path
          fill="#C5CCD6"
          d="M12.275 16.889c1.976.02 3.781-1.058 4.614-2.755a4.138 4.138 0 01-1.663.31c-2.24-.002-4.055-1.72-4.057-3.84.022-1.435.858-2.746 2.188-3.434a8.142 8.142 0 00-1.082-.058C9.423 7.112 7.111 9.3 7.111 12c0 2.7 2.312 4.889 5.164 4.889z"
        />
      )}
    </svg>
  );
}

export default ThemeIcon;
