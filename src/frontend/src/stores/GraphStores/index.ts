import { combineSlices } from "@reduxjs/toolkit";
import { graphLibrarySlice } from "./GraphLibrary";
import { graphStatusSlice } from "./GraphStatus";

export const GraphStore = combineSlices(
  graphLibrarySlice,
  graphStatusSlice,
);

export { useInitGraphs } from "./hooks";