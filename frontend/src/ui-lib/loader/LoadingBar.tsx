import ButtonComponent from "../../common/ui-components/buttons/ButtonWrapper";
import { ButtonTypes } from "../../common/interfaces/ButtonTypes";
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

const LoadingBar = ({ text = DEFAULT_LOADING_PHRASE, icon = <WorkflowPlaceHolderIcon />, className, actionButton, callback }: Props) => {
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
  const retryButton = callback && <ButtonComponent actionName="Retry" type={ButtonTypes.ACTION} onClickCallback={callback} />;

  return (
    <div className={classNames(className)} style={{ whiteSpace: "pre-wrap" }}>
      {icon}
      <div className={styles.text}>{formatError(text)}</div>
      {actionButton || retryButton}
    </div>
  );
};

export default LoadingBar;
