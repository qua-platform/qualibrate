import { App, H5GroveProvider } from "@h5web/app";
import React, { useContext } from "react";

import type { FeedbackContext } from "@h5web/app";
import LoadingBar from "../../../ui-lib/loader/LoadingBar";
import { getFeedbackMailto } from "@h5web/app";
import DataViewContext from "../context/DataViewContext";
import { H5_URL } from "../../../DEPRECATED_common/modules";

function getFeedbackURL(context: FeedbackContext): string {
  const email = process.env.REACT_APP_FEEDBACK_EMAIL || "";

  return getFeedbackMailto(context, email);
}

type Props = {
  selectedPath: string | null;
};
const HDF5Explorer: React.FunctionComponent<Props> = React.memo(({ selectedPath }) => {
  return selectedPath ? (
    <H5GroveProvider url={H5_URL} filepath={selectedPath} axiosConfig={{ params: { file: selectedPath } }}>
      <App getFeedbackURL={getFeedbackURL} />
    </H5GroveProvider>
  ) : (
    <LoadingBar text="No job was selected" />
  );
});

export default () => {
  const { currentHDF5File } = useContext(DataViewContext);
  return <HDF5Explorer selectedPath={currentHDF5File} />;
};
