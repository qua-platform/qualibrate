import { useEffect, useRef, useState } from "react";
import Api from "../../../utils/api";

export enum UrlState {
  NOT_EXIST,
  EXIST,
}
export default function useUrlState(url: string, timeout = 3000): [state: UrlState, msg: string] {
  const [urlState, setUrlState] = useState(UrlState.NOT_EXIST);
  const [message, setUrlMessage] = useState("");
  const i = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (urlState === UrlState.EXIST) {
      clearInterval(i.current);
    }
  }, [urlState]);
  useEffect(() => {
    i.current = window.setInterval(async () => {
      const { isOk, error } = await Api.pingURL(url);
      setUrlState(isOk ? UrlState.EXIST : UrlState.NOT_EXIST);
      setUrlMessage((error as string) || "");
    }, timeout);

    return () => clearInterval(i.current);
  }, [url]);

  return [urlState, message];
}
