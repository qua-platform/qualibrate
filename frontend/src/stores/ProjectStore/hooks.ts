import { useEffect } from "react";
import { useRootDispatch } from "..";
import { fetchProjectsAndActive, fetchShouldRedirectUserToProjectPage } from "./actions";

export const initProjects = () => {
  const dispatch = useRootDispatch();

    useEffect(() => {
      dispatch(fetchProjectsAndActive());
      dispatch(fetchShouldRedirectUserToProjectPage());
    }, []);
}
