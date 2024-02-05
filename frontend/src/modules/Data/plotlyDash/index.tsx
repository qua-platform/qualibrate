import React from "react";
import { PLOTLY_DASH_URL } from "../../../DEPRECATED_common/modules";
import { useDataViewContext } from "../context/DataViewContext";
import LoadingBar from "../../../ui-lib/loader/LoadingBar";
const index = () => {
  const { selectedJob } = useDataViewContext();
  const eui = selectedJob?.eui.path;
  if (!eui) {
    return <LoadingBar text="No job was selected" />;
  }
  return <iframe src={PLOTLY_DASH_URL(eui)} style={{ height: "100%", width: "100%" }} />;
};

export default index;
