import { getLanguagefromFileName, getTokens } from "../../jobDiff/utils";

import "react-diff-view/style/index.css";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { Decoration, Diff, Hunk } from "react-diff-view";
import React, { useMemo } from "react";

import { DiffData, IHunk } from "../../jobDiff/types";
import cyKeys from "../../../../utils/cyKeys";
import ExpandableElement from "../../../../DEPRECATED_components/ExpandableElement/ExpandableElement";
import styles from "./styles/JobDiff.module.scss";

const DiffComponent: React.FC<DiffData> = ({ oldPath, newPath, oldRevision, newRevision, type, hunks }) => {
  if (!hunks.length) {
    return <>"no data"</>;
  }
  const tokens = useMemo(() => getTokens(hunks, getLanguagefromFileName(newPath)), [hunks, newPath]);

  return (
    <div key={oldRevision + "-" + newRevision} className="file-diff" data-cy={cyKeys.jobs.DIFF_ROW}>
      <ExpandableElement
        styleProp={{ wrapper: styles.wrapper, header: styles.header, subHeader: styles.subHeader, arrowIcon: styles.arrowIcon }}
        name={oldPath === newPath ? oldPath : `${oldPath} -> ${newPath}`}
        isOpened={false}
      >
        <div>
          <Diff viewType="split" diffType={type} hunks={hunks} tokens={tokens}>
            {(hunks: Array<IHunk>) =>
              hunks.map((hunk) => [
                <Decoration key={"deco-" + hunk.content}>
                  <div className="hunk-header">{hunk.content}</div>
                </Decoration>,
                <Hunk key={hunk.content} hunk={hunk} />,
              ])
            }
          </Diff>
        </div>
      </ExpandableElement>
    </div>
  );
};

export default DiffComponent;
