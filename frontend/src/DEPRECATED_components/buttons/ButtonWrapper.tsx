import React, { useContext } from "react";
import { BLUE_BUTTON } from "../../utils/colors";
import { ButtonProps } from "../../DEPRECATED_common/DEPRECATED_interfaces/ButtonProps";
import { ButtonTypes } from "../../DEPRECATED_common/DEPRECATED_interfaces/ButtonTypes";
import InterfaceContext from "../../DEPRECATED_context/InterfaceContext";
import actionButtonStyles from "../buttons/styles/ActionButton.module.scss";
import { classNames } from "../../utils/classnames";
import plainButtonStyles from "../buttons/styles/PlainButton.module.scss";
import styles from "../buttons/styles/ButtonWrapper.module.scss";

const defaultClassName = styles.button;
const actionButtonClassName = actionButtonStyles.actionButton;
const plainButtonClassName = plainButtonStyles.plainButton;

const getButtonStyles = (type: ButtonTypes, customClassName?: string) => {
  return classNames(
    customClassName,
    defaultClassName,
    type === ButtonTypes.PLAIN && plainButtonClassName,
    type === ButtonTypes.ACTION && actionButtonClassName
  );
};

/* TODO
 * This component is overcomplicated. Use buttons from:
 * ./entropy_frontend_ui/src/ui-lib/components/Button
 *
 * If you just need a clickable wrap - use <button> all default styles are already reset
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
  showPopup,
  disabled = false,
  ...restProps
}: ButtonProps) => {
  const {
    actions: { openPopup },
  } = useContext(InterfaceContext);

  const renderButtonContent = () => {
    const textContent = !hideText ? actionName : "";

    if (iconSide === "RIGHT") {
      return (
        <>
          {textContent || ""}
          {icon}
        </>
      );
    }

    return (
      <>
        c{icon}
        {textContent || ""}
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
      className={getButtonStyles(type, customClassName)}
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
