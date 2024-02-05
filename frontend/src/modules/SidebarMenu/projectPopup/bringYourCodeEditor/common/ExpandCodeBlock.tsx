import React, { useMemo, useState } from "react";

import styles from "./ExpandCodeBlock.module.scss";
import { ArrowIcon } from "../../../../../ui-lib/Icons/ArrowIcon";
import Prism from "prismjs";
import "prismjs/components/prism-json";
type Props = {
  title: string;
  subTitle?: string;
  code: string;
};

const ExpandCodeBlock: React.FunctionComponent<Props> = ({ title, code, subTitle }) => {
  const codeHTML = useMemo(() => {
    return Prism.highlight(code, Prism.languages.json, "json");
  }, [code]);
  const [expanded, setExpanded] = useState(false);
  return (
    <div>
      <button onClick={() => setExpanded((e) => !e)} className={styles.titleButton}>
        <ArrowIcon options={{ rotationDegree: !expanded ? -180 : 0 }} />
        {title}
      </button>
      {expanded && (
        <div className={styles.content}>
          {subTitle && <div className={styles.subTitle}>{subTitle}</div>}
          <pre dangerouslySetInnerHTML={{ __html: codeHTML }} className={styles.codeBlock} />
        </div>
      )}
    </div>
  );
};

export default ExpandCodeBlock;
