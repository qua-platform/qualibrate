import React, { PropsWithChildren, useContext, useRef, useState } from "react";

import styles from "./ProjectPopup.module.scss";
import { useActiveProjectContext } from "../../ActiveProject/ActiveProjectContext";
import { IconProps } from "../../../DEPRECATED_common/DEPRECATED_interfaces/IconProps";
import StorageStatusIcon from "./icons/StorageStatusIcon";
import WebInterfaceStatusIcon from "./icons/WebInterfaceStatusIcon";
import ProjectStatusIcon from "./icons/ProjectStatusIcon";
import TextButton from "../../../ui-lib/components/Button/TextButton";
import { CloseIcon } from "../../../ui-lib/Icons/CloseIcon";
import useOnClickOutside from "../../../ui-lib/hooks/useOnClickOutside";
import cyKeys from "../../../utils/cyKeys";
import BringYourCodeEditor from "./bringYourCodeEditor";
import { PopupProps } from "../../../DEPRECATED_common/DEPRECATED_interfaces/Popup";
import CheckBox from "../../../ui-lib/components/Checkbox/Checkbox";
import GlobalThemeContext from "../../themeModule/GlobalThemeContext";

const ProjectPopup: React.FunctionComponent<PopupProps> = ({ onClose }) => {
  const { enterProject, activeProject } = useActiveProjectContext();
  const [showEditorPopup, setShowEditorPopup] = useState(false);
  const popupRef = useRef<HTMLDivElement | null>(null);
  const { pinSideMenu, setPinSideMenu } = useContext(GlobalThemeContext);
  useOnClickOutside(popupRef, onClose);

  return (
    <div className={styles.container} ref={popupRef}>
      {showEditorPopup && <BringYourCodeEditor onClose={() => setShowEditorPopup(false)} />}
      <button onClick={onClose} className={styles.closeIcon}>
        <CloseIcon />
      </button>
      <Item icon={WebInterfaceStatusIcon} title={"Web Interface"}>
        OK
      </Item>
      <Item icon={ProjectStatusIcon} title={"Project"}>
        <div className={styles.box}>{activeProject?.name}</div>
        <TextButton data-cy={cyKeys.projectPopup.CHANGE_PROJECT} text="Change" onClick={() => enterProject()} />
      </Item>
      <Item icon={StorageStatusIcon} title={"Data Store"}>
        <div className={styles.box}>localhost</div>
        <TextButton text="Bring-your-code-editor" onClick={() => setShowEditorPopup(true)} />
      </Item>
      <CheckBox
        key={"pin-menu-checkbox"}
        checked={pinSideMenu}
        onChange={() => setPinSideMenu(!pinSideMenu)}
        placeholder={"Keep side menu expanded"}
      />
    </div>
  );
};

type ItemProps = {
  icon: React.FC<IconProps & { isOk: true }>;
  title: string;
};
function Item({ icon: Icon, title, children }: PropsWithChildren<ItemProps>) {
  return (
    <div className={styles.itemContainer}>
      <Icon isOk />
      <div className={styles.content}>
        <div className={styles.title}>{title}</div>
        {children}
      </div>
    </div>
  );
}
export default ProjectPopup;
