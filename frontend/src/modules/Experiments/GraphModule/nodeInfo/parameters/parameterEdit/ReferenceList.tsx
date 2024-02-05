import React from "react";
import { classNames } from "../../../../../../utils/classnames";
import { useEditParameterContext } from "../EditParameterContext";
import { SuggestedItem } from "../../../../types";

import styles from "./styles/ReferenceList.module.scss";

type ItemProps = SuggestedItem & {
  onClick: React.MouseEventHandler<HTMLElement>;
  isActive?: boolean;
  startSymbols?: string;
  endSymbols?: string;
};

const ReferenceItem = ({ different, matched, onClick, isActive, endSymbols, startSymbols }: ItemProps) => (
  <li onClick={onClick} className={classNames(styles.item, isActive && styles.item__active)}>
    {startSymbols}
    <span className={styles.matched}>{matched}</span>
    <span>{different}</span>
    {endSymbols}
  </li>
);

const ReferenceList = ({ activeItemIndex }: { activeItemIndex: number }) => {
  const { suggestedReferences, setReference } = useEditParameterContext();

  const listIsHidden = (suggestedReferences?.length || 0) < 1;

  if (listIsHidden) {
    return <></>;
  }

  return (
    <ul className={styles.list}>
      {suggestedReferences?.map((item, index) => (
        <ReferenceItem {...item} isActive={activeItemIndex === index} key={item.different} onClick={() => setReference(item.original)} />
      ))}
    </ul>
  );
};

export default React.memo(ReferenceList);
