import { combineSlices } from "@reduxjs/toolkit";
// import { commonGraphSlice } from "./GraphCommon";
import { graphLibrarySlice } from "./GraphLibrary";
import { graphStatusSlice } from "./GraphStatus";

export const GraphStore = combineSlices(
  // commonGraphSlice,
  graphLibrarySlice,
  graphStatusSlice,
);

export { useInitGraphs } from "./hooks";