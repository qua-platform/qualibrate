import React from "react";
import { useDataViewContext } from "../context/DataViewContext";
import LoadingBar from "../../../ui-lib/loader/LoadingBar";
import { DATA_VIEW_DASH_URL } from "../../../DEPRECATED_common/modules";

const index = () => {
  const { selectedJob } = useDataViewContext();
  const eui = selectedJob?.eui.path;
  if (!eui) {
    return <LoadingBar text="No job was selected" />;
  }
  return <iframe src={DATA_VIEW_DASH_URL(eui)} style={{ height: "100%", width: "100%" }} />;
};

export default index;
