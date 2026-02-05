import React from "react";
import styles from "./TagOption.module.scss";
import {classNames} from "../../../utils/classnames";
import {stringToHexColor} from "../../../modules/Data/components/ExecutionCard/components/TagsList/helpers";

type Props = {
    tag: string;
    handleToggleTag: (tagName: string) => void;
    isSelected?: boolean;
    showCheckbox?: boolean;
};

const TagOption: React.FC<Props> = ({tag, handleToggleTag, isSelected, showCheckbox = true}) => {
    return (
        <div data-testid={`tag-option-${tag}`} className={styles.tagFilterOption} onClick={() => handleToggleTag(tag)} data-filter={tag}>
            {showCheckbox && <div data-testid="tag-checkbox" className={classNames(styles.tagFilterCheckbox, isSelected && styles.selected)}/>}
            <div className={styles.tagFilterRow}>
                <div className={styles.tagDot} style={{background: stringToHexColor(tag)}}/>
                <div>{tag}</div>
            </div>
        </div>
    );
};
export default TagOption;
