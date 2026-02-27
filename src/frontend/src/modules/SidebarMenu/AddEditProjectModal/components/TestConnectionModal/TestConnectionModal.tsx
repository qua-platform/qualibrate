import React from "react";
import styles from "./TestConnectionModal.module.scss";
import { Dialog } from "@mui/material";
import { classNames } from "../../../../../utils";

interface Props {
  isVisible: boolean;
  isSuccessful: boolean;
  handleOnClose: () => void;
  database?: {
    host: string;
    port: string;
    name: string;
    username: string;
    password: string;
  };
}

const TestConnectionModal = ({ isVisible, database, handleOnClose, isSuccessful }: Props) => {
  const iconPath = isSuccessful ? (
    <path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.751.751 0 0 1 .018-1.042.751.751 0 0 1 1.042-.018L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0Z" />
  ) : (
    <path d="M2.343 13.657A8 8 0 1 1 13.657 2.343 8 8 0 0 1 2.343 13.657ZM6.03 4.97a.751.751 0 0 0-1.042.018.751.751 0 0 0-.018 1.042L6.94 8 4.97 9.97a.749.749 0 0 0 .326 1.275.749.749 0 0 0 .734-.215L8 9.06l1.97 1.97a.749.749 0 0 0 1.275-.326.749.749 0 0 0-.215-.734L9.06 8l1.97-1.97a.749.749 0 0 0-.326-1.275.749.749 0 0 0-.734.215L8 6.94Z" />
  );

  const title = isSuccessful ? "Connection Successful" : "Connection Failed";
  const message = isSuccessful
    ? `Successfully connected to database "${database?.name}" at ${database?.host}:${database?.port}`
    : "Unable to connect to database. Please check your credentials and ensure the database server is running.";

  return (
    <Dialog classes={{ paper: styles.modalWrapper }} open={isVisible} onClose={handleOnClose}>
      <div className={styles.notificationDialog}>
        <div className={classNames(styles.notificationIcon, !isSuccessful && styles.error)}>
          <svg width={24} height={24} viewBox="0 0 16 16" fill="currentColor">
            {iconPath}
          </svg>
        </div>

        <h3 className={styles.notificationTitle}>{title}</h3>

        <p className={styles.notificationMessage}>{message}</p>

        <div className={styles.notificationActions}>
          <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={handleOnClose}>
            OK
          </button>
        </div>
      </div>
    </Dialog>
  );
};

export default TestConnectionModal;
