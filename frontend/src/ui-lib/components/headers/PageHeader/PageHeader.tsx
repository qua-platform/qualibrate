import React from "react";

import styles from "./PageHeader.module.scss";
import { classNames } from "../../../../utils/classnames";
import Header, { HeaderProps } from "../Header";

type PageHeaderProps = HeaderProps & {
  withBorder?: boolean;
};

const PageHeader = ({ withBorder, className, ...restProps }: PageHeaderProps) => {
  return <Header {...restProps} className={classNames(className, withBorder && styles.withBorder)} />;
};

export default PageHeader;
