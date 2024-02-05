import React, { useCallback } from "react";

import LinkPlaceholder from "./LinkPlaceholder";
import styles from "./BannerGuide.module.scss";

interface Props {
  name: string;
  description?: string;
  icon?: React.ReactElement;
  link?: string;
  onClick: () => void;
}

const BannerGuide = (props: Props) => {
  const handleOnClick = useCallback(() => {
    props.onClick && props.onClick();
  }, [props.onClick]);

  return (
    <div className={styles.bannerWrapper} onClick={handleOnClick}>
      <LinkPlaceholder {...props} />
    </div>
  );
};

export default BannerGuide;
