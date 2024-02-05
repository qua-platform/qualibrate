import React, { useCallback } from "react";

import TableItem from "./TableItem";
import { TableItemProps } from "../../../DEPRECATED_common/DEPRECATED_interfaces/TableItemsProps";
import styles from "./Table.module.scss";

interface TableProps {
  headerName?: string;
  items: TableItemProps[];
  iconHandler?: (type: number | undefined) => React.ReactElement;
}

const Table = ({ headerName, items, iconHandler }: TableProps) => {
  const renderTableContent = useCallback(
    (items: TableItemProps[]) => {
      return (
        <div className={styles.tableContent}>
          {items.map((item, index) => {
            return <TableItem key={index} {...item} rowIcon={iconHandler && iconHandler(item?.rowIconType)} />;
          })}
        </div>
      );
    },
    [iconHandler, items]
  );

  return (
    <div className={styles.wrapper}>
      <h5>{headerName}</h5>
      {renderTableContent(items)}
    </div>
  );
};

export default Table;
