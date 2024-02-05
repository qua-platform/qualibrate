import ExpandableElement from "../../../../DEPRECATED_components/ExpandableElement/ExpandableElement";
import NavigationPanel from "./NavigationPanel";
import React from "react";

const CurrentJobInfo = (): React.ReactElement => {
  return (
    <ExpandableElement name="Current job" isOpened>
      <NavigationPanel />
    </ExpandableElement>
  );
};

export default CurrentJobInfo;
