import { combineReducers, configureStore } from "@reduxjs/toolkit";
import authReducer from "./AuthStore/AuthStore";
import { useDispatch } from "react-redux";
import projectsReducer from "./ProjectStore/ProjectStore";
import { graphStore } from "./GraphStores/index";

export const rootReducer = combineReducers({
  auth: authReducer,
  projects: projectsReducer,
  graph: graphStore,
})

const store = configureStore({
  reducer: rootReducer
});

export type RootDispatch = typeof store.dispatch;
export const useRootDispatch = useDispatch.withTypes<RootDispatch>();
export type RootState = ReturnType<typeof store.getState>;
export default store;
