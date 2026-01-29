import React, { useCallback, useEffect, useState } from "react";
import styles from "./SnapshotComments.module.scss";
import { useSelector } from "react-redux";
import { getSelectedSnapshot, getSelectedSnapshotId } from "../../../stores/SnapshotsStore";
import { SnapshotComment } from "../../../stores/SnapshotsStore/api/SnapshotsApi";
import CommentModal from "../CommentModal";
import {
  addCommentToSnapshot,
  fetchAllCommentsForSnapshot,
  removeCommentFromSnapshot,
  updateSnapshotComment,
} from "../../../stores/SnapshotsStore/utils";

export type OnSaveHandlerProps = {
  mode: "add" | "edit" | "delete";
  comment?: SnapshotComment;
  commentText?: string;
};

const SnapshotComments: React.FC = () => {
  const selectedSnapshotId = useSelector(getSelectedSnapshotId);
  const selectedSnapshot = useSelector(getSelectedSnapshot);

  const [showCommentModal, setShowCommentModal] = useState<boolean>(false);
  const [modalDialogMode, setModalDialogMode] = useState<"add" | "edit" | "delete">("add");
  const [commentForModal, setCommentForModal] = useState<SnapshotComment | undefined>(undefined);
  const [comments, setComments] = useState<SnapshotComment[]>([]);

  const handleOpenDialogOnClick = (mode: "add" | "edit" | "delete", comment?: SnapshotComment) => {
    if (comment) {
      setCommentForModal(comment);
    }
    setModalDialogMode(mode);
    setShowCommentModal(true);
  };

  const handleOnAddNewComment = async (commentText: string) => {
    if (!selectedSnapshot) return;

    const response = await addCommentToSnapshot(selectedSnapshot?.id, commentText);
    if (response && response?.isOk && response?.result) {
      const newComment = response?.result;
      setComments((prev) => [...prev, newComment]);
    }
    // TODO Uncomment this to demo mocks
    const newComment = { id: comments.length, value: commentText, createdAt: "2025-11-16 14:30:00" };
    setComments((prev) => [...prev, newComment]);
  };

  const handleOnEditNewComment = async (comment: SnapshotComment, commentText: string) => {
    if (!selectedSnapshot) return;

    const updatedComment = { ...comment, value: commentText };
    const response = await updateSnapshotComment(selectedSnapshot.id, updatedComment);

    if (response?.isOk && response?.result) {
      setComments((prev) => prev.map((c) => (c.id === comment.id ? updatedComment : c)));
    }
    // TODO Uncomment this to demo mocks
    setComments((prev) => prev.map((c) => (c.id === comment.id ? updatedComment : c)));
  };

  const handleOnRemoveCommentClick = async (comment: SnapshotComment) => {
    if (!selectedSnapshot) return;

    const response = await removeCommentFromSnapshot(selectedSnapshot.id, comment.id);

    if (response?.isOk && response?.result) {
      setComments((prev) => prev.filter((c) => c.id !== comment.id));
    }
    // TODO Uncomment this to demo mocks
    setComments((prev) => prev.filter((c) => c.id !== comment.id));
  };

  const handleOnDialogClose = () => {
    setShowCommentModal(false);
    setCommentForModal(undefined);
  };
  const handleOnDialogSave = async ({ mode, comment, commentText }: OnSaveHandlerProps) => {
    if (mode === "add" && commentText) {
      await handleOnAddNewComment(commentText);
    } else if (mode === "edit" && comment && commentText) {
      await handleOnEditNewComment(comment, commentText);
    } else if (mode === "delete" && comment) {
      await handleOnRemoveCommentClick(comment);
    }
    handleOnDialogClose();
  };

  const fetchComments = useCallback(async () => {
    if (!selectedSnapshotId) return;
    const response = await fetchAllCommentsForSnapshot(selectedSnapshotId);
    if (response?.isOk && response.result) {
      setComments(response.result);
    }
    // TODO Uncomment this to use mocks
    setComments([
      {
        id: 1,
        value: "Comment 1",
        createdAt: "2024-11-16 14:30:00",
      },
      {
        id: 2,
        value: "Comment 2",
        createdAt: "2024-11-16 14:30:00",
      },
      {
        id: 3,
        value: "Comment 3",
        createdAt: "2024-11-16 14:30:00",
      },
      {
        id: 4,
        value: "Comment 4",
        createdAt: "2024-11-16 14:30:00",
      },
      {
        id: 5,
        value: "Comment 5",
        createdAt: "2024-11-16 14:30:00",
      },
      {
        id: 6,
        value: "Comment 6",
        createdAt: "2024-11-16 14:30:00",
      },
      {
        id: 7,
        value: "Comment 7",
        createdAt: "2024-11-16 14:30:00",
      },
    ]);
  }, [selectedSnapshotId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  if (!selectedSnapshot) {
    return null;
  }

  return (
    <div className={styles.commentSection}>
      <div className={styles.commentHeader}>
        <div className={styles.commentLabel}>Comments</div>
        <button className={styles.addCommentBtn} onClick={() => handleOpenDialogOnClick("add")} title="Add comment">
          +
        </button>
      </div>
      {comments?.length === 0 && <div className={styles.noComment}>No comments yet</div>}
      {comments?.length > 0 && (
        <div className={styles.commentsList}>
          {comments.map((comment, index) => (
            <div key={`${comment.id}-${index}`} className={styles.commentItem}>
              <div className={styles.commentItemHeader}>
                <div className={styles.commentTimestamp}>{comment.createdAt}</div>
                {/* 2024-11-16 14:30:00 */}
                <div className={styles.commentItemAction}>
                  <button className={styles.editCommentBtn} onClick={() => handleOpenDialogOnClick("edit", comment)} title="Edit comment">
                    {/* "openCommentModal('exec-001', 0)"*/}✎
                  </button>
                  <button
                    className={styles.deleteCommentBtn}
                    onClick={() => handleOpenDialogOnClick("delete", comment)}
                    title="Delete comment"
                  >
                    {/* "openDeleteCommentModal('exec-001', 0)"*/}
                    🗑
                  </button>
                </div>
              </div>
              <div className={styles.commentItemText}>{comment.value}</div>
            </div>
          ))}
        </div>
      )}
      {showCommentModal && (
        <CommentModal
          mode={modalDialogMode}
          comment={commentForModal}
          handleOnSave={handleOnDialogSave}
          handleOnClose={handleOnDialogClose}
        />
      )}
    </div>
  );
};

export default SnapshotComments;
