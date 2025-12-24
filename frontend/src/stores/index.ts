import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { AuthReducer } from "./AuthStore";
import { useDispatch } from "react-redux";
import { ProjectsReducer } from "./ProjectStore";
import { GraphStore } from "./GraphStores/index";
import { NodesReducer } from "./NodesStore";
import { NavigationReducer } from "./NavigationStore";
import { WebSocketReducer } from "./WebSocketStore";
import { SnapshotsReducer } from "./SnapshotsStore";

export const rootReducer = combineReducers({
  auth: AuthReducer,
  projects: ProjectsReducer,
  graph: GraphStore,
  nodes: NodesReducer,
  navigation: NavigationReducer,
  webSocket: WebSocketReducer,
  snapshots: SnapshotsReducer
});

const store = configureStore({
  reducer: rootReducer
});

export type RootDispatch = typeof store.dispatch;
export const useRootDispatch = useDispatch.withTypes<RootDispatch>();
export type RootState = ReturnType<typeof store.getState>;
export default store;
