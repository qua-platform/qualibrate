import React from "react";
import styles from "./SelectorList.module.scss";

export interface HeaderProps {
  listHeader?: string;
  actions?: React.ReactElement[];
}

const Header = ({ listHeader = "Select list item", actions }: HeaderProps) => {
  return (
    <div className={styles.header}>
      <div className={styles.headerTitle}>{listHeader}</div>
      <div className={styles.headerActions}>{actions}</div>
    </div>
  );
};

export default Header;
