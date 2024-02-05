import React, { PropsWithChildren } from "react";
import { classNames } from "../../../utils/classnames";
import styles from "./Page.module.scss";

interface Props {
  sectionName?: string;
  className?: string;
}

const PageSection = ({ sectionName, className, children }: PropsWithChildren<Props>) => {
  return (
    <div className={classNames(styles.pageSection, className)}>
      {sectionName && <h3 className={styles.sectionName}>{sectionName}</h3>}
      <div className={styles.sectionContent}>{children}</div>
    </div>
  );
};

export default PageSection;
