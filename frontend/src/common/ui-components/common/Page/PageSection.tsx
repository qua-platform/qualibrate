import React, { PropsWithChildren } from "react";
// eslint-disable-next-line css-modules/no-unused-class
import styles from "./Page.module.scss";
import { classNames } from "../../../../utils/classnames";

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
