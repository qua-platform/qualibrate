import { CSSProperties, MutableRefObject, useEffect, useRef, useState } from "react";
import useElementSize from "./useElementSize";

export default function useModuleStyle<T extends HTMLElement>(limit = 800): [MutableRefObject<T | null>, CSSProperties, boolean] {
  const ref = useRef<T | null>(null);
  const size = useElementSize(ref?.current);
  const [style, setStyle] = useState({});
  const [isSmall, setIsSmall] = useState<boolean>(false);

  useEffect(() => {
    if (size.width < 500) {
      setStyle({ padding: "20px 10px" });
    } else if (size.width < 800) {
      setStyle({ padding: "20px" });
    } else {
      setStyle({});
    }

    if (size.width < limit) {
      setIsSmall(true);
    } else {
      setIsSmall(false);
    }
  }, [size]);
  return [ref, style, isSmall];
}
