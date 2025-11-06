import { combineSlices } from "@reduxjs/toolkit";
import { commonGraphSlice } from "./GraphCommon/GraphCommonStore";
import { graphLibrarySlice } from "./GraphLibrary/GraphLibraryStore";
import graphStatusSlice from "./GraphStatus/GraphStatusStore";

export const graphStore = combineSlices(
  commonGraphSlice,
  graphLibrarySlice,
  graphStatusSlice,
);
