import React from "react";
import styles from "./LinkPlaceholder.module.scss";

interface Props {
  name: string;
  description?: string;
  icon?: React.ReactElement;
}

const LinkPlaceholder = ({ name, description, icon }: Props) => {
  return (
    <a className={styles.linkWrapper}>
      {icon && <div className={styles.linkIcon}>{icon}</div>}
      <div className={styles.linkInfo}>
        <div className={styles.linkName}>{name}</div>
        <div className={styles.linkDescription}>{description}</div>
      </div>
    </a>
  );
};

export default LinkPlaceholder;
