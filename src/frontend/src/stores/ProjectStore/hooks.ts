import { useEffect } from "react";
import { useRootDispatch } from "../index";
import { fetchProjectsAndActive } from "./actions";

export const useInitProjects = () => {
  const dispatch = useRootDispatch();

    useEffect(() => {
      dispatch(fetchProjectsAndActive());
    }, []);
};
