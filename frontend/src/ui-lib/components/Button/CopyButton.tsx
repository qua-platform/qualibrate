import React, { useCallback, useMemo, useRef, useState } from "react";
import { OperationIcon } from "../../Icons/OperationIcon";
import { ACCENT_COLOR_LIGHT, ACTIVE_TEXT } from "../../../utils/colors";
import useHover from "../../hooks/useHover";
import { copyToKeyboard } from "../../../utils/ui/copyToKeyboard";

type Props = {
  value: string | number;
  hideLabel?: boolean;
};
export function CopyButton({ value, hideLabel }: Props): React.ReactElement {
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const iconRef = useRef<SVGSVGElement | null>(null);
  const isHovered = useHover(buttonRef);
  const [isGreen, setIsGreen] = useState(false);

  const color = useMemo(() => {
    if (isGreen) {
      return "#00D59A";
    } else {
      return isHovered ? ACTIVE_TEXT : ACCENT_COLOR_LIGHT;
    }
  }, [isHovered, isGreen]);
  const handleCopy = useCallback(() => {
    const t1 = window.setTimeout(() => setIsGreen(true), 500);
    const t2 = window.setTimeout(() => setIsGreen(false), 2000);
    try {
      const elems = iconRef.current?.getElementsByTagName("animate");
      [...(elems || [])].forEach((anim) => anim.beginElement());
    } catch (e) {
      console.error("Failed to start animation");
    }
    copyToKeyboard(value);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [value]);
  return (
    <button ref={buttonRef} onClick={handleCopy} style={{ position: "relative" }}>
      {!hideLabel && isGreen && (
        <span
          style={{
            position: "absolute",
            right: "20px",
            bottom: "-3px",
            color: "#00D59A",
          }}
        >
          Copied!
        </span>
      )}
      <OperationIcon color={color} ref={iconRef} />
    </button>
  );
}
