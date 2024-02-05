import React from "react";
import { classNames } from "../../utils/classnames";
import styles from "./Table.module.scss";

interface Props {
  tableName?: string;
  onClick?: (event: React.MouseEvent<HTMLElement>) => void;
  className?: string;
  children: React.ReactNode;
}

const Table = ({ tableName, onClick, className, children, ...restProps }: Props) => {
  return (
    <div className={classNames(styles.table, className)} onClick={onClick} {...restProps}>
      {tableName && <h3 className={styles.tableName}>{tableName}</h3>}
      {children}
    </div>
  );
};

export default Table;
