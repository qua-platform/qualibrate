import React from "react";
import { classNames } from "../../utils/classnames";
import styles from "./Tag.module.scss";
import useSwitch from "@react-hook/switch";

interface Props {
  name: string;
}

const Tag = ({ name = "Tag name" }: Props) => {
  const [isActive, toggle] = useSwitch(false);

  const tagClassName = isActive ? classNames(styles.tag, styles.tag_active) : styles.tag;

  return (
    <div className={tagClassName} onClick={toggle}>
      {name}
    </div>
  );
};

export default Tag;
