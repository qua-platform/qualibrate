import ReactJson from "react-json-view";
import LoadingBar from "../../../../../../ui-lib/loader/LoadingBar";
import { getColorTheme, LIGHT } from "../../../../../themeModule/themeHelper";
import { useEditParameterContext } from "../EditParameterContext";
import useResolvedPreview from "./utils/resolvePreview";
import { isPending } from "../../../../../../utils/statusHelpers";

const JsonPreviewComponent = () => {
  const { reference } = useEditParameterContext();
  const [preview, status] = useResolvedPreview(reference || "");

  if (isPending(status)) {
    return <LoadingBar text="No preview available" />;
  }

  if (typeof preview?.data !== "object") {
    return <div>{preview?.data}</div>;
  }

  return (
    <ReactJson
      style={{ backgroundColor: "transparent" }}
      name={""}
      theme={getColorTheme() === LIGHT ? "summerfruit:inverted" : "google"}
      src={preview?.data || {}}
      displayObjectSize
      displayDataTypes={false}
      displayArrayKey={false}
      enableClipboard={false}
    />
  );
};

export default JsonPreviewComponent;
