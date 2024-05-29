import { Dispatch, SetStateAction, useCallback } from "react";

export default function useOnFieldChange<D, F extends keyof D>(setData: Dispatch<SetStateAction<D>>): (field: F) => (value: D[F]) => void {
  return useCallback(
    (field: F) => (value: D[F]) => {
      setData((old) => ({ ...old, [field]: value }));
    },
    [setData],
  );
}
