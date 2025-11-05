import { PayloadAction, createSlice } from "@reduxjs/toolkit";

export interface NavigationState {
  activePage: null | string,
  openedOncePages: string[],
  topBarAdditionalComponents: { [id: string]: React.JSX.Element },
}

const initialState: NavigationState = {
  activePage: null,
  openedOncePages: [],
  topBarAdditionalComponents: {},
};

export const navigationSlice = createSlice({
  name: "mainPage",
  initialState,
  reducers: {
    setActivePage: (state, action) => {
      state.activePage = action.payload;
      state.openedOncePages = [...state.openedOncePages, action.payload];
    },
    setTopBarAdditionalComponents: (state, action) => {
      state.topBarAdditionalComponents = action.payload;
    },
  }
});

export default navigationSlice.reducer;
