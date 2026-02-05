import React, { useState } from "react";
import styles from "./ManageTagsModal.module.scss";
import InputField from "../../../../../../components/Input";
import { Dialog } from "@mui/material";
import { useSelector } from "react-redux";
import { getAllTags, getSelectedSnapshot, setAllTags, updateSnapshotTags } from "../../../../../../stores/SnapshotsStore";
import { stringToHexColor } from "../TagsList/helpers";
import { classNames } from "../../../../../../utils/classnames";
import { useRootDispatch } from "../../../../../../stores";
import { addTagsToSnapshot } from "../../../../../../stores/SnapshotsStore/utils";

type Props = {
  currentSelectedTags?: string[];
  handleOnClose: () => void;
};

const ManageTagsModal: React.FC<Props> = ({ currentSelectedTags = [], handleOnClose }) => {
  const dispatch = useRootDispatch();
  const allTags = useSelector(getAllTags);
  const selectedSnapshot = useSelector(getSelectedSnapshot);
  const [newTag, setNewTag] = useState("");
  const [selectedTags, setSelectedTags] = useState(currentSelectedTags);

  const handleToggleTag = (newTagName: string) => {
    setSelectedTags((prev) => (prev.includes(newTagName) ? prev.filter((tag) => tag !== newTagName) : [...prev, newTagName]));
  };

  const handleOnSave = () => {
    if (!selectedSnapshot) return;

    const shouldAddNewTag = newTag && !allTags.includes(newTag);
    const finalTags = shouldAddNewTag ? [...selectedTags, newTag] : selectedTags;

    dispatch(updateSnapshotTags(finalTags));
    addTagsToSnapshot(selectedSnapshot.id, finalTags);

    if (shouldAddNewTag) {
      dispatch(setAllTags([...allTags, newTag]));
      setSelectedTags(finalTags);
    }

    handleOnClose();
  };
  if (!allTags) {
    return null;
  }

  return (
    <Dialog classes={{ paper: styles.modal }} open={true} onClose={handleOnClose}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h3>Manage Tags</h3>
        </div>

        <div className={styles.modalBody}>
          <div className={styles.tagList}>
            {allTags.map((tag) => {
              const isSelected = selectedTags.includes(tag);

              return (
                <div key={tag} className={classNames(styles.tagItem, isSelected && styles.selected)} onClick={() => handleToggleTag(tag)}>
                  <div className={styles.tagCheckbox} />
                  <div className={styles.tagInfo}>
                    <div className={styles.tagDot} style={{ background: stringToHexColor(tag) }} />
                    <span>{tag}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/*<input*/}
          {/*  type="text"*/}
          {/*  className={styles.newTagInput}*/}
          {/*  placeholder="Create new tag..."*/}
          {/*  value={newTag}*/}
          {/*  onChange={(val) => setNewTag(val)}*/}
          {/*/>*/}
          <InputField
            dataTestId="search-field"
            inputClassName={styles.newTagInput}
            name="search"
            placeholder="Create new tag..."
            value={newTag}
            autoComplete="off"
            onChange={(val) => setNewTag(val)}
          />
        </div>

        <div className={styles.modalFooter}>
          <button className={`${styles.modalBtn} ${styles.secondary}`} onClick={handleOnClose}>
            Cancel
          </button>
          <button className={`${styles.modalBtn} ${styles.primary}`} onClick={handleOnSave}>
            Save
          </button>
        </div>
      </div>
    </Dialog>
  );
};
export default ManageTagsModal;
