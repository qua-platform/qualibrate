import React from "react";
import styles from "./DeleteProjectModal.module.scss";
import { Dialog } from "@mui/material";

interface Props {
  isVisible: boolean;
  projectName?: string;
  handleOnClose: () => void;
  handleOnConfirm: () => void;
}

const DeleteProjectModal = ({ isVisible, projectName, handleOnClose, handleOnConfirm }: Props) => {
  return (
    <Dialog classes={{ paper: styles.modalWrapper }} open={isVisible} onClose={handleOnClose}>
      <div className={styles.confirmDialog}>
        <div className={styles.confirmDialogIcon}>
          <svg viewBox="0 0 16 16" fill="currentColor">
            <path d="M6.457 1.047c.659-1.234 2.427-1.234 3.086 0l6.082 11.378A1.75 1.75 0 0 1 14.082 15H1.918a1.75 1.75 0 0 1-1.543-2.575Zm1.763.707a.25.25 0 0 0-.44 0L1.698 13.132a.25.25 0 0 0 .22.368h12.164a.25.25 0 0 0 .22-.368Zm.53 3.996v2.5a.75.75 0 0 1-1.5 0v-2.5a.75.75 0 0 1 1.5 0ZM9 11a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z" />
          </svg>
        </div>

        <h3 className={styles.confirmDialogTitle}>Delete Project?</h3>

        <p className={styles.confirmDialogMessage}>
          Are you sure you want to delete <span className={styles.confirmDialogProject}>{projectName}</span>
          ?<br />
          This action cannot be undone.
        </p>

        <div className={styles.confirmDialogActions}>
          <button className={`${styles.btn} ${styles.btnSecondary}`} onClick={handleOnClose}>
            Cancel
          </button>

          <button className={`${styles.btn} ${styles.btnDanger}`} onClick={handleOnConfirm}>
            Delete
          </button>
        </div>
      </div>
    </Dialog>
  );
};

export default DeleteProjectModal;
