import React, {useState} from "react";
import useClickOutside from "../../utils/hooks/useClickOutside";
import styles from "./TagFilter.module.scss";
import {classNames} from "../../utils/classnames";
import {useSelector} from "react-redux";
import {getAllTags} from "../../stores/SnapshotsStore";
import {TagFilterIcon} from "../Icons";
import TagOption from "./TagOption";

type Props = {
    selectedTags: string[];
    handleToggleTag: (tagName: string) => void;
};

const TagFilter: React.FC<Props> = ({selectedTags, handleToggleTag}) => {
    const allTags = useSelector(getAllTags);
    const [showTags, setShowTags] = useState(false);
    const ref = useClickOutside(() => setShowTags(false));

    const onClickHandler = () => {
        setShowTags(!showTags);
    };

    return (
        <div data-testid="tag-filter" className={styles.wrapper}>
            <div data-testid="tag-filter-icon-button" className={styles.filterButton} id="tagFilterBtn" onClick={onClickHandler}>
                <TagFilterIcon width={16} height={16}/>
            </div>
            <div data-testid="tag-dropdown" className={classNames(styles.tagDropdown, showTags && styles.active)} id="dateFilterDropdown"
                 ref={ref}>
                {allTags.map((tag) => {
                    const isTagSelected = selectedTags.includes(tag);
                    return (
                        <TagOption key={tag} tag={tag} handleToggleTag={handleToggleTag} isSelected={isTagSelected}/>
                    );
                })}
            </div>
        </div>
    );
};
export default TagFilter;
