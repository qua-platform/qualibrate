import React from "react";
import styles from "./TestConnectionModal.module.scss";
import { Dialog } from "@mui/material";
import { classNames } from "../../../../../utils";
import { NotificationErrorIcon, NotificationSuccessIcon } from "../../../../../components";

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
  const title = isSuccessful ? "Connection Successful" : "Connection Failed";
  const message = isSuccessful
    ? `Successfully connected to database "${database?.name}" at ${database?.host}:${database?.port}`
    : "Unable to connect to database. Please check your credentials and ensure the database server is running.";

  return (
    <Dialog classes={{ paper: styles.modalWrapper }} open={isVisible} onClose={handleOnClose}>
      <div className={styles.notificationDialog}>
        <div className={classNames(styles.notificationIcon, !isSuccessful && styles.error)}>
          {isSuccessful ? <NotificationSuccessIcon /> : <NotificationErrorIcon />}
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
