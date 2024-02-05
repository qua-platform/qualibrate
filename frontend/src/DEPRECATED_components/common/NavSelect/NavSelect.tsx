import React, { MouseEventHandler, useCallback, useMemo } from "react";
import { classNames } from "../../../utils/classnames";
// eslint-disable-next-line css-modules/no-unused-class
import styles from "./NavSelect.module.scss";
import cyKeys from "../../../utils/cyKeys";

interface NavSelectProps {
  items: any[]; // TODO Fix this (NavItemProps)
  activeItemIndex: number;
  isShown?: boolean;
  className?: string;
  actions?: any; // TODO Fix this (React.ReactElement)
}

const NavSelect = ({ items, activeItemIndex, isShown = true, className, actions }: NavSelectProps) => {
  const renderActions = useCallback(() => {
    if (!actions) {
      return;
    }

    return actions;
  }, [actions]);

  const searchResults = (resultsNumber: number | null | undefined) =>
    useMemo(() => {
      return resultsNumber ? <div className={styles.resultsNumber}>{resultsNumber}</div> : null;
    }, [resultsNumber]);

  return isShown ? (
    <div className={classNames(styles.wrapper, className)}>
      <ul className={styles.list}>
        {items.map((item, index) => {
          const isActive = index === activeItemIndex;
          const onClick = item.onClick;
          return (
            <li
              key={index}
              className={classNames(isActive && styles.active, styles.menuItem)}
              onClick={onClick as MouseEventHandler<HTMLLIElement>}
              data-cy={cyKeys.NAVIGATION_SELECT_ITEM}
            >
              <span key={index}>{item.name}</span>
              {/*{searchResults(item.resultsNumber)}*/}
            </li>
            // <NavSelectItem {...item} keyIndex={index} isActive={index === activeItemIndex} data-cy={cyKeys.NAVIGATION_SELECT_ITEM} />
          );
        })}
      </ul>
      <div className={styles.actions}>{renderActions()}</div>
    </div>
  ) : (
    <></>
  );
};

export default NavSelect;
