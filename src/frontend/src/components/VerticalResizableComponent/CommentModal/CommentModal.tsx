import React, { useState } from "react";
import styles from "./CommentModal.module.scss";
import { useSelector } from "react-redux";
import { getSelectedSnapshot } from "../../../stores/SnapshotsStore";
import { SnapshotComment } from "../../../stores/SnapshotsStore/api/SnapshotsApi";
import { classNames } from "../../../utils/classnames";
import { Dialog } from "@mui/material";
import { OnSaveHandlerProps } from "../SnapshotComments/SnapshotComments";

type Props = {
  mode: "add" | "edit" | "delete";
  comment?: SnapshotComment;
  handleOnClose: () => void;
  handleOnSave: ({ mode, comment, commentText }: OnSaveHandlerProps) => Promise<void>;
};

const CommentModal: React.FC<Props> = ({ mode, comment, handleOnClose, handleOnSave }) => {
  const selectedSnapshot = useSelector(getSelectedSnapshot);
  const [commentText, setCommentText] = useState<string>(comment?.value ?? "");

  if (!selectedSnapshot) {
    return null;
  }
  let title = "Add comment";
  if (mode === "edit") {
    title = "Edit comment";
  } else if (mode === "delete") {
    title = "Delete comment";
  }

  return (
    <Dialog classes={{ paper: styles.modal }} open={true} onClose={handleOnClose}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h3>{title}</h3>
        </div>
        <div className={styles.modalBody}>
          {mode !== "delete" && (
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className={styles.commentTextarea}
              id="commentTextarea"
              placeholder="Add your notes..."
            />
          )}
          {mode === "delete" && <p>Are you sure you want to delete this comment? This action cannot be undone.</p>}
        </div>
        <div className={styles.modalFooter}>
          <button className={classNames(styles.modalBtn, styles.modalBtnSecondary)} onClick={handleOnClose}>
            Cancel
          </button>
          <button
            className={classNames(styles.modalBtn, styles.modalBtnPrimary, mode === "delete" && styles.modalBtnDelete)}
            onClick={() => handleOnSave({ mode, comment, commentText })}
          >
            {mode === "delete" ? "Yes, Delete" : "Save"}
          </button>
        </div>
      </div>
    </Dialog>
  );
};

export default CommentModal;
