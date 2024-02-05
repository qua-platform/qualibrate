import React, { PropsWithChildren } from "react";

import { classNames } from "../../../utils/classnames";
import cyKeys from "../../../utils/cyKeys";
import styles from "./Header.module.scss";

export type HeaderProps = PropsWithChildren<{
  title?: string;
  subTitle?: string;
  preComponent?: React.ReactElement;
  controls?: React.ReactElement;
  withBtmMargin?: boolean;

  className?: string;
}>;

const Header = ({ title, subTitle, preComponent, children, withBtmMargin, className }: HeaderProps) => {
  return (
    <div className={classNames(styles.header, className, withBtmMargin && styles.withBtmMargin)}>
      {preComponent}
      <div className={styles.titleContainer}>
        <div className={styles.text} title={title} data-cy={cyKeys.common.PAGE_TITLE}>
          {title}
        </div>
        <div className={styles.subText} title={subTitle} data-cy={cyKeys.common.PAGE_SUBTITLE}>
          {subTitle}
        </div>
      </div>
      <div className={styles.content}>{children}</div>
    </div>
  );
};

export default Header;
