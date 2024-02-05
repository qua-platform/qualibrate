import React from "react";

import FilterButton from "../../../../DEPRECATED_components/DEPRECATED_Buttons/FilterButton";
import OrderSortButton from "../OrderSortButton";
import AddJobButton from "../AddJobButton";
import PageHeader from "../../../../ui-lib/components/headers/PageHeader/PageHeader";
import styles from "./JobHeader.module.scss";
import { MinifyProp } from "../../../../types";
import GroupJobButton from "../../GroupJobButton";
import SelectJobButton from "../../Buttons/SelectJobButton";
import CompareButton from "../../Buttons/CompareButton";
import DeleteJobButton from "../../Buttons/DeleteJobButton";
import OutlineButton from "../../../../ui-lib/components/Button/OutlineButton";
import { DownloadIcon } from "../../../../ui-lib/Icons/DownloadIcon";
import { OUTLINE_BUTTON_TEXT } from "../../../../utils/colors";
import cyKeys from "../../../../utils/cyKeys";
import { useJobsListContext } from "../../context/JobsListContext";
import { useJobsSelectionContext } from "../../context/JobsSelectionContext";
import { useShowFilterContext } from "../jobPage/layoutContexts";

function DefaultActions({ minify }: MinifyProp): React.ReactElement {
  const { filter } = useJobsListContext();
  const [, setShowFilter] = useShowFilterContext();

  return (
    <div className={styles.actions}>
      <GroupJobButton key={1} minify={minify} />
      <OrderSortButton key={2} minify={minify} />
      <FilterButton key={3} isApplied={Boolean(filter)} onClick={() => setShowFilter((f) => !f)} dataCy={cyKeys.jobs.FILTER_BUTTON} />
      <SelectJobButton key={4} />
      <AddJobButton key={5} />
    </div>
  );
}

function SelectActions({ minify }: MinifyProp): React.ReactElement {
  const { exportSelected, selectedJobs } = useJobsSelectionContext();
  return (
    <div className={styles.actions}>
      <CompareButton key={1} minify={minify} />
      <OutlineButton title={"Get .HDF5 data files for selected jobs"} onClick={exportSelected} disabled={(selectedJobs?.length || 0) < 1}>
        <DownloadIcon color={OUTLINE_BUTTON_TEXT} />
        {!minify && <div style={{ whiteSpace: "nowrap" }}>Download data</div>}
      </OutlineButton>
      <DeleteJobButton key={3} minify={minify} />
      <SelectJobButton key={4} />
    </div>
  );
}

const JobHeader: React.FunctionComponent<MinifyProp> = ({ minify }) => {
  const { isActive: isSelectionActive } = useJobsSelectionContext();

  const { jobsData } = useJobsListContext();
  return (
    <PageHeader title="Job list" subTitle={`Running jobs ${jobsData?.running}/${jobsData?.total}`} withBorder>
      {isSelectionActive ? <SelectActions minify={minify} /> : <DefaultActions minify={minify} />}
    </PageHeader>
  );
};

export default JobHeader;
