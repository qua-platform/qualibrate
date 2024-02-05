import React, { PropsWithChildren, useRef } from "react";

import styles from "./Dialog.module.scss";
import OverlayBackground from "./OverlayBackground";
import { CloseIcon } from "../../Icons/CloseIcon";
import useOnClickOutside from "../../hooks/useOnClickOutside";
import IconButton from "../Button/IconButton";

type Props = {
  onClose?: () => void;
  title?: string;
};
const Dialog: React.FunctionComponent<PropsWithChildren<Props>> = ({ onClose, title, children }) => {
  const popupRef = useRef<HTMLDivElement | null>(null);
  useOnClickOutside(popupRef, onClose);

  return (
    <OverlayBackground>
      <div className={styles.container} ref={popupRef}>
        {onClose && <IconButton icon={CloseIcon} onClick={onClose} className={styles.closeIcon} />}
        <div className={styles.title}>{title}</div>
        <div className={styles.content}>{children}</div>
      </div>
    </OverlayBackground>
  );
};
export default Dialog;
