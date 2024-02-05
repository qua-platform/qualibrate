import EntropyLogoIcon from "../Icons/EntropyLogoIcon";
import React, { useContext } from "react";
import SidebarMenu from "../../modules/SidebarMenu/SidebarMenu";
import { classNames } from "../../utils/classnames";
import styles from "./styles/Layout.module.scss";
import ToastComponent from "../../modules/toastModule/ToastComponent";
import GlobalThemeContext from "../../modules/themeModule/GlobalThemeContext";

const EmptyPlaceholder = (
  <div className={styles.emptyPlaceholder}>
    <EntropyLogoIcon height={200} width={400} />
  </div>
);

interface Props {
  className?: string;
  children?: React.ReactNode;
}

const MainLayout = ({ className, children }: Props) => {
  const { pinSideMenu } = useContext(GlobalThemeContext);

  return (
    <div className={styles.wrapper}>
      <SidebarMenu />
      <div className={classNames(styles.content, pinSideMenu && styles.addLeftMargin, className)}>{children ?? EmptyPlaceholder}</div>
      <ToastComponent />
    </div>
  );
};

export default MainLayout;
