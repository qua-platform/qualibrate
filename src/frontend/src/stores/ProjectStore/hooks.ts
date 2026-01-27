import { useEffect } from "react";
import { useRootDispatch } from "../index";
import { fetchProjectsAndActive, fetchShouldRedirectUserToProjectPage } from "./actions";

export const useInitProjects = () => {
  const dispatch = useRootDispatch();

    useEffect(() => {
      dispatch(fetchProjectsAndActive());
      dispatch(fetchShouldRedirectUserToProjectPage());
    }, []);
};
