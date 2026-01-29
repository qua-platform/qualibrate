import React from "react";
import styles from "./TagsList.module.scss";
import { SnapshotDTO } from "../../../../../../stores/SnapshotsStore";
import { setSelectedSnapshot, updateSnapshotTags } from "../../../../../../stores/SnapshotsStore/actions";
import { addTagsToSnapshot } from "../../../../../../stores/SnapshotsStore/utils";
import { useRootDispatch } from "../../../../../../stores";

type Props = {
  snapshot?: SnapshotDTO;
  // tags?: string[];
  handleOnAddTagClick: () => void;
};

const TagsList: React.FC<Props> = ({ snapshot, handleOnAddTagClick }) => {
  const dispatch = useRootDispatch();

  const handleOnRemoveClick = (selectedTag: string) => {
    dispatch(setSelectedSnapshot(snapshot));
    if (snapshot) {
      const newTagArray = snapshot?.tags?.filter((tag) => tag !== selectedTag) ?? [];
      dispatch(updateSnapshotTags(newTagArray));
      addTagsToSnapshot(snapshot.id, newTagArray);
    }
  };

  if (!snapshot) {
    return null;
  }

  return (
    <div className={styles.executionTags}>
      {snapshot?.tags?.map((tag, index) => (
        <div key={`${tag}${index}`} className={styles.tag}>
          <div className={styles.tagDot} />
          {tag}
          <span className={styles.tagRemove} onClick={() => handleOnRemoveClick(tag)}>
            ×
          </span>
        </div>
      ))}

      <button className={styles.addTagButton} onClick={handleOnAddTagClick}>
        + Tag
      </button>
    </div>
  );
};
export default TagsList;
