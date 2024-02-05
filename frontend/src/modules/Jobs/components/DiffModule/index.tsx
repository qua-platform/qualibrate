import BlueButton from "../../../../ui-lib/components/Button/BlueButton";
import { useJobDiffContext } from "../../context/JobDiffContext";
import DiffCompareAction from "../JobDiff/diffCompareAction/DiffCompareAction";
import DiffFrame from "./DiffFrame";

import styles from "./styles/JobDiffWindow.module.scss";
import PageHeader from "../../../../ui-lib/components/headers/PageHeader/PageHeader";
import { useDiffVisibilityContext } from "../../context/DiffVisibilityContext";

const JobDiffWindow = () => {
  const { diffObject } = useJobDiffContext();

  const { setDiffIsShown } = useDiffVisibilityContext();
  return (
    <div className={styles.wrapper}>
      <PageHeader title="Compare jobs" subTitle="Selected jobs" withBorder>
        <DiffCompareAction />
        <BlueButton isSecondary onClick={() => setDiffIsShown(false)}>
          Cancel
        </BlueButton>
      </PageHeader>
      <div className={styles.diffContent}>
        <DiffFrame name="Parameters diff" diff={diffObject?.parameters} />
        <DiffFrame name="Workflow diff" diff={diffObject?.workflow} />
      </div>
    </div>
  );
};

export default JobDiffWindow;
