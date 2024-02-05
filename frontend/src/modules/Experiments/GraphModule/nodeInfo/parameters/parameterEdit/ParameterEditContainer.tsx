import React, { useEffect, useRef, useState } from "react";
import useKeyPress from "../../../../../../ui-lib/hooks/useKeyPress";
import { useEditParameterContext } from "../EditParameterContext";
import useLoopedCounter from "../../../../hooks/useLoopedCounter";
import JsonPreviewComponent from "./JsonPreview";
import ReferenceControl from "./ReferenceControl";
import ReferenceList from "./ReferenceList";

import styles from "./styles/ReferenceModule.module.scss";
import InputField from "../../../../../../DEPRECATED_components/common/Input/InputField";
import cyKeys from "../../../../../../utils/cyKeys";
import { useNodeInfoContext } from "../../../utils/NodeInfoContext";
import QuestionMarkIcon from "../../../../../../ui-lib/Icons/QuestionMarkIcon";
import ParameterInfoPopup from "./ParameterInfoPopup";

const ParameterEditContainer = () => {
  const ref = useRef(null);
  const [focused, setFocused] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const { suggestedReferences, setReference, reference } = useEditParameterContext();
  const { setExpanded } = useNodeInfoContext();

  useEffect(() => {
    setExpanded(true);
    return () => setExpanded(false);
  }, []);
  const { increase, decrease, counter: activeItemIndex, setLimit } = useLoopedCounter(0);

  const applySelectedReference = () => {
    if (!suggestedReferences) {
      return;
    }
    const { original } = suggestedReferences[activeItemIndex];

    setReference(original);
  };

  useKeyPress("ArrowDown", ref, increase);
  useKeyPress("ArrowUp", ref, decrease);
  useKeyPress("Enter", ref, applySelectedReference);

  useEffect(() => {
    if (!ref.current) {
      return;
    }
  }, [ref]);

  useEffect(() => {
    if (!suggestedReferences) {
      return;
    }
    setLimit(suggestedReferences.length);
  }, [suggestedReferences]);

  return (
    <div className={styles.module} ref={ref} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}>
      <div className={styles.inputField}>
        <InputField
          value={reference || undefined}
          onChange={setReference}
          data-cy={cyKeys.experiment.nodeInfo.edit.INPUT}
          className={styles.referenceInput}
        />
        <button className={styles.infoBtn} onClick={() => setShowInfo((s) => !s)}>
          <QuestionMarkIcon />
        </button>
        {showInfo && <ParameterInfoPopup />}
        {focused && <ReferenceList activeItemIndex={activeItemIndex} />}
      </div>
      <div className={styles.previewTitle}>Value preview</div>
      <div className={styles.previewJSON}>
        <JsonPreviewComponent />
      </div>
      <ReferenceControl />
    </div>
  );
};

export default React.memo(ParameterEditContainer);
