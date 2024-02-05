// import React, { MouseEventHandler, useMemo } from "react";
//
// import { NavItemProps } from "../../../DEPRECATED_common/DEPRECATED_interfaces/NavItemProps";
// import { classNames } from "../../../utils/classnames";
// import styles from "./NavSelect.module.scss";
//
// interface Props extends NavItemProps {
//   isActive: boolean;
// }
//
// const NavSelectItem = ({ name = "Parameter", onClick, isActive, resultsNumber, ...restProps }: Props) => {
//   const searchResults = useMemo(() => resultsNumber && <div className={styles.resultsNumber}>{resultsNumber}</div>, [resultsNumber]);
//   return (
//     <li
//       className={classNames(isActive && styles.active, styles.menuItem)}
//       onClick={onClick as MouseEventHandler<HTMLLIElement>}
//       {...restProps}
//     >
//       <span>{name}</span>
//       {searchResults}
//     </li>
//   );
// };
//
// export default NavSelectItem;
