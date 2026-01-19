import { useEffect } from "react";
import { useRootDispatch } from "../index";
import { fetchAllCalibrationGraphs } from "./GraphLibrary";

export const useInitGraphs = () => {
  const dispatch = useRootDispatch();

  useEffect(() => {
    dispatch(fetchAllCalibrationGraphs());
  }, []);
};