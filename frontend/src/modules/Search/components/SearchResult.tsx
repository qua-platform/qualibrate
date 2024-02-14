import { ACCENT_COLOR_LIGHT } from "../../../utils/colors";
// import { CURRENT_USER } from "../../../DEPRECATED_context/UserContext";
import { CalendarIcon } from "../../../ui-lib/Icons/CalendarIcon";
import { NotebookIcon } from "../../../ui-lib/Icons/NotebookIcon";
import React from "react";
import { UserIcon } from "../../../ui-lib/Icons/UserIcon";
import styles from "./SearchResult.module.scss";

// interface Props {
//   title: string;
//   titleIcon?: React.ReactElement;
//   description?: string | React.ReactElement;
//   date?: Date;
//   user?: string;
// }

const SearchResult = () => {
  return (
    <div className={styles.result}>
      <div className={styles.resultDescription}>
        <div className={styles.resultHeader}>
          <div className={styles.resultType}>
            <NotebookIcon height={18} />
          </div>
          <div className={styles.resultName}>Blandit facilisi donec consectetur amet, T1 quis.</div>
        </div>
        <div className={styles.resultText}>
          Lectus dignissim rutrum pellentesque quis vitae tincidunt. Volutpat, eu amet rhoncus morbi faucibus augue iaculis vel et. Lorem
          aenean bibendum sagittis morbi enim tempus. Ullamcorper ultrices gravida lacinia dictum in posuere T1.
        </div>
      </div>
      <div className={styles.resultMetaInfo}>
        <div className={styles.resultTimestamp}>
          <div className={styles.resultDateIcon}>
            <CalendarIcon height={18} color={ACCENT_COLOR_LIGHT} />
          </div>
          <div className={styles.resultCreationDate}>10/12/21 at 10:30</div>
        </div>
        <div className={styles.resultOwner}>
          <div className={styles.resultOwnerThumb}>
            <UserIcon height={18} />
          </div>
          {/*<div className={styles.resultOwnerName}>{CURRENT_USER}</div>*/}
        </div>
      </div>
    </div>
  );
};

export default SearchResult;
