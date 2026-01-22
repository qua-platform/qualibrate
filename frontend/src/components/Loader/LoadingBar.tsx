import React from "react";
import { WorkflowPlaceHolderIcon } from "../Icons/WorkflowPlaceholderIcon";
import { classNames } from "../../utils/classnames";
// eslint-disable-next-line css-modules/no-unused-class
import styles from "./LoaderPage.module.scss";

const DEFAULT_LOADING_PHRASE = "Loading...";

interface Props {
  text?: string;
  icon?: React.ReactElement;
  className?: string;
  actionButton?: React.ReactElement;
  callback?: () => void;
}

const LoadingBar = ({ text = DEFAULT_LOADING_PHRASE, icon = <WorkflowPlaceHolderIcon />, className, actionButton }: Props) => {
  const formatError = (error: string | { detail: string }) => {
    if (typeof error === "string") {
      return error.split("\\n").map((item, idx) => {
        return (
          <span key={idx}>
            {item}
            <br />
          </span>
        );
      });
    } else {
      return <span key={(error as { detail: string }).detail}>{(error as { detail: string }).detail}</span>;
    }
  };

  return (
    <div className={classNames(className)} style={{ whiteSpace: "pre-wrap" }}>
      {icon}
      <div className={styles.text}>{formatError(text)}</div>
      {actionButton}
    </div>
  );
};

export default LoadingBar;
