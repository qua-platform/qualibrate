import React, { useContext } from "react";

import { BLUE_BUTTON } from "../../utils/colors";
import { ButtonProps } from "../../DEPRECATED_common/DEPRECATED_interfaces/ButtonProps";
import { ButtonTypes } from "../../DEPRECATED_common/DEPRECATED_interfaces/ButtonTypes";
import InterfaceContext from "../../DEPRECATED_context/InterfaceContext";
import actionButtonStyles from "./styles/ActionButton.module.scss";
import { classNames } from "../../utils/classnames";
import plainButtonStyles from "./styles/PlainButton.module.scss";
import sortButtonStyles from "./styles/SortButton.module.scss";
import styles from "./styles/ButtonWrapper.module.scss";
import { ArrowIcon } from "../../ui-lib/Icons/ArrowIcon";

const defaultClassName = styles.button;
const actionButtonClassName = actionButtonStyles.actionButton;
const plainButtonClassName = plainButtonStyles.plainButton;
const sortButtonClassName = sortButtonStyles.sortButton;

const getButtonStyles = (type: ButtonTypes, customClassName?: string, sortButton?: boolean) => {
  return classNames(
    customClassName,
    defaultClassName,
    type === ButtonTypes.PLAIN && plainButtonClassName,
    type === ButtonTypes.ACTION && actionButtonClassName,
    sortButton && sortButtonClassName
  );
};

/* TODO
 * This component is overcomplicated. Use buttons from:
 * ./entropy_frontend_ui/src/ui-lib/components/Button
 *
 * If you just need a clickable wrap - use <button> all default styles are reseted
 *
 */
const DEPRECATEDButton: React.FunctionComponent<ButtonProps> = ({
  icon,
  iconSide,
  actionName,
  onClickCallback,
  type = ButtonTypes.ACTION,
  customClassName,
  textColor,
  hideText = false,
  onSubmitType = "button",
  sortButton,
  showPopup,
  iconRotation = 180,
  disabled = false,
  ...restProps
}: ButtonProps) => {
  const {
    actions: { openPopup },
  } = useContext(InterfaceContext);

  const renderButtonContent = () => {
    const textContent = !hideText ? actionName : "";

    const sortIcon = sortButton && <ArrowIcon options={{ rotationDegree: iconRotation }} />;

    if (iconSide === "RIGHT") {
      return (
        <>
          {textContent || ""}
          {icon}
          {sortIcon}
        </>
      );
    }

    return (
      <>
        {icon}
        {textContent || ""}
        {sortIcon}
      </>
    );
  };

  const handleClick = () => {
    if (disabled) {
      return;
    }

    if (showPopup) {
      openPopup(showPopup);
    }

    if (onClickCallback) {
      onClickCallback();
    }
  };

  const defaultBackgroundColor = onSubmitType === "submit" && BLUE_BUTTON;

  const enabledConfig = disabled ? { opacity: 0.5, cursor: "not-allowed" } : {};

  return (
    <button
      onClick={handleClick}
      className={getButtonStyles(type, customClassName, sortButton)}
      style={{
        ...enabledConfig,
        color: textColor,
        backgroundColor: defaultBackgroundColor || undefined,
      }}
      type={onSubmitType}
      {...restProps}
    >
      {renderButtonContent()}
    </button>
  );
};

export default DEPRECATEDButton;
