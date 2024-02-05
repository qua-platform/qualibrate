import { useEffect } from "react";
import { useActiveProjectContext } from "./ActiveProjectContext";

type Cb = () => void;
export function useOnProjectUpdate(cb: Cb): void {
  const { projectUserState } = useActiveProjectContext();

  useEffect(() => {
    cb();
  }, [cb, projectUserState?.job, projectUserState?.workflow]);
}
