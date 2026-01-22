import { ModuleKey } from "../../modules/AppRoutes";
import { createSlice } from "@reduxjs/toolkit";

export interface NavigationState {
  activePage: null | ModuleKey,
  openedOncePages: ModuleKey[],
}

const initialState: NavigationState = {
  activePage: null,
  openedOncePages: [],
};

export const navigationSlice = createSlice({
  name: "mainPage",
  initialState,
  reducers: {
    setActivePage: (state, action) => {
      state.activePage = action.payload;
      state.openedOncePages = [...state.openedOncePages, action.payload];
    },
  }
});

export default navigationSlice.reducer;
