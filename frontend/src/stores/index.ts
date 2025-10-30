import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./AuthStore/AuthStore";
import { useDispatch } from "react-redux";
import projectsReducer from "./ProjectStore/ProjectStore";

const store = configureStore({
  reducer: {
    auth: authReducer,
    projects: projectsReducer
  }
});

export type RootDispatch = typeof store.dispatch;
export const useRootDispatch = useDispatch.withTypes<RootDispatch>();
export type RootState = ReturnType<typeof store.getState>;
export default store;
