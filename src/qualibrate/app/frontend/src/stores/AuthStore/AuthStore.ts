import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface AuthState {
  isAuthorized: boolean
  triedLoginWithEmptyString: boolean
  authError: string | undefined
}

const initialState: AuthState = {
  isAuthorized: true,
  triedLoginWithEmptyString: false,
  authError: undefined
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAuthorize: (state, action: PayloadAction<boolean>) => {
      state.isAuthorized = action.payload;
    },
    setError: (state, action: PayloadAction<string | undefined>) => {
      state.authError = action.payload;
    },
    setTriedLoginWithEmptyString: state => {
      state.triedLoginWithEmptyString = true;
    }
  }
});

export default authSlice.reducer;