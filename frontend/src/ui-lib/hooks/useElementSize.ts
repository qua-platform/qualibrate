import { useCallback, useEffect, useState } from "react";
import useResize from "./useResize";

interface Size {
  width: number;
  height: number;
}

function useElementSize<T extends HTMLElement>(element: T | null): Size {
  const [size, setSize] = useState<Size>({
    width: 0,
    height: 0,
  });

  const handleSize = useCallback(() => {
    setSize({
      width: element?.offsetWidth || 0,
      height: element?.offsetHeight || 0,
    });
  }, [element?.offsetHeight, element?.offsetWidth]);

  useResize(handleSize);

  useEffect(() => {
    handleSize();
  }, [element?.offsetHeight, element?.offsetWidth]);

  return size;
}

export default useElementSize;
