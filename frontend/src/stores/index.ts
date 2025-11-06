import { combineReducers, configureStore } from "@reduxjs/toolkit";
import authReducer from "./AuthStore/AuthStore";
import { useDispatch } from "react-redux";
import projectsReducer from "./ProjectStore/ProjectStore";
import { graphStore } from "./GraphStores/index";
import nodesReducer from "./NodesStore/NodesStore";
import navigationReducer from "./NavigationStore/NavigationStore";
import webSocketReducer from "./WebSocketStore/WebSocketStore";
import SnapshotsReducer from "./SnapshotsStore/SnapshotsStore";

export const rootReducer = combineReducers({
  auth: authReducer,
  projects: projectsReducer,
  graph: graphStore,
  nodes: nodesReducer,
  navigation: navigationReducer,
  webSocket: webSocketReducer,
  snapshots: SnapshotsReducer
})

const store = configureStore({
  reducer: rootReducer
});

export type RootDispatch = typeof store.dispatch;
export const useRootDispatch = useDispatch.withTypes<RootDispatch>();
export type RootState = ReturnType<typeof store.getState>;
export default store;
