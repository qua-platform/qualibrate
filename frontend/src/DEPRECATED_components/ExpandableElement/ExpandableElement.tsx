import { ArrowIcon } from "../../ui-lib/Icons/ArrowIcon";
import React from "react";
import styles from "./style.module.scss";
import useSwitch from "@react-hook/switch";

interface Props {
  styleProp?: {
    wrapper: string;
    header: string;
    subHeader: string;
    arrowIcon: string;
  };
  name: React.ReactNode;
  isOpened?: boolean;
  children: React.ReactNode;
}

const ExpandableElement = ({ styleProp, name, isOpened, children }: Props) => {
  const [opened, toggleVisibility] = useSwitch(isOpened);
  return (
    <div className={styleProp?.wrapper ?? styles.wrapper}>
      <div className={styleProp?.header ?? styles.header} onClick={toggleVisibility}>
        <div className={styleProp?.subHeader ?? styles.subHeader}>{name}</div>
        <div className={styleProp?.arrowIcon ?? ""}>
          <ArrowIcon options={{ rotationDegree: opened && -180 }} />
        </div>
      </div>
      {opened && children}
    </div>
  );
};

export default ExpandableElement;
