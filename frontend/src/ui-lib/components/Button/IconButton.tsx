import React, { useMemo, useRef } from "react";
import { IconProps } from "../../../DEPRECATED_common/DEPRECATED_interfaces/IconProps";
import useHover from "../../hooks/useHover";
import { ACTIVE_TEXT, BLUE_ICON_BUTTON_HOVER_TEXT, BLUE_ICON_BUTTON_TEXT, BODY_FONT } from "../../../utils/colors";
import styles from "./IconButton.module.scss";
import { classNames } from "../../../utils/classnames";
import { DefaultButtonProps } from "./types";
import { RequestStatus } from "../../../types";
import { isPending } from "../../../utils/statusHelpers";
import CircularLoader from "../../Icons/CircularLoader";

export type IconButtonProps = DefaultButtonProps & {
  icon: React.FC<IconProps>;
  title?: string;
  withText?: boolean;
  isBlue?: boolean;
  status?: RequestStatus;
};
const IconButton: React.FC<IconButtonProps> = ({ icon: Icon, title, onClick, className, withText, isBlue, status, ...restProps }) => {
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const isHovered = useHover(buttonRef);
  const color = useMemo(
    () => (isBlue ? (isHovered ? BLUE_ICON_BUTTON_HOVER_TEXT : BLUE_ICON_BUTTON_TEXT) : isHovered ? ACTIVE_TEXT : BODY_FONT),
    [isBlue, isHovered],
  );

  if (status && isPending(status)) {
    return <CircularLoader color={isBlue ? BLUE_ICON_BUTTON_TEXT : BODY_FONT} />;
  }

  return (
    <button
      title={title}
      ref={buttonRef}
      className={classNames(styles.iconButton, withText && styles.withText, className)}
      onClick={onClick}
      style={{ color }}
      {...restProps}
    >
      <Icon color={color} />
      {withText ? title : undefined}
    </button>
  );
};

export default IconButton;
