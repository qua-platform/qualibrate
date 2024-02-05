import { PopupModes, PopupTypes } from "../../DEPRECATED_common/DEPRECATED_enum/PopupTypes";
import React, { PropsWithChildren, useCallback, useContext, useMemo } from "react";

import DEPRECATEDButton from "../DEPRECATED_Buttons/ButtonWrapper";
import { ButtonTypes } from "../../DEPRECATED_common/DEPRECATED_interfaces/ButtonTypes";
import { CloseIcon } from "../../ui-lib/Icons/CloseIcon";
import InterfaceContext from "../../DEPRECATED_context/InterfaceContext";
import { classNames } from "../../utils/classnames";
import styles from "./styles/Popup.module.scss";

interface Props {
  onSubmit?: (data: any) => void;
  formName?: string;
  customClassName?: string;
  type: PopupTypes;
  mode?: PopupModes;
}

// TODO: remove, use RightPopupContainer instead
const PopupContainer = ({
  children,
  onSubmit,
  formName = "popupForm",
  customClassName,
  type,
  mode = PopupModes.SIDE_VIEW,
  ...restProps
}: PropsWithChildren<Props>) => {
  const {
    actions: { closeCurrentPopup },
  } = useContext(InterfaceContext);

  const handleOnSubmit = (e: { preventDefault: () => void }) => {
    e.preventDefault();

    const formEl = document.forms[formName as any]; // TODO Fix this
    const formData = new FormData(formEl);

    const data = Object.fromEntries(formData);

    onSubmit && onSubmit(data);
  };

  const Popup = useMemo(
    () => (
      <form
        className={classNames(styles.container, styles[mode], styles[type], customClassName)}
        onSubmit={handleOnSubmit}
        method="POST"
        id={formName}
        {...restProps}
      >
        <DEPRECATEDButton
          icon={<CloseIcon />}
          customClassName={styles.closePopupButton}
          type={ButtonTypes.PLAIN}
          onClickCallback={closeCurrentPopup.bind({}, type)}
        />
        {children}
      </form>
    ),
    [mode, customClassName, onSubmit]
  );

  const renderPopup = useCallback(() => {
    switch (mode) {
      case PopupModes.CENTER_VIEW:
        return <div className={styles.popup_center_view_wrapper}>{Popup}</div>;
      default:
        return Popup;
    }
  }, [Popup, mode]);

  return renderPopup();
};

export default PopupContainer;
