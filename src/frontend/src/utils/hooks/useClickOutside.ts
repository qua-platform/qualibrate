import { useCallback, useEffect, useRef } from "react";

const useClickOutside = (callback: () => void) => {
  const ref = useRef<HTMLDivElement>(null);

  const handleCallback = useCallback((evt: MouseEvent | TouchEvent) => {
    if (ref?.current && !ref.current.contains(evt.target as Node)) {
      callback();
    }
  }, [callback]);

  useEffect(() => {
    window.addEventListener("mouseup", handleCallback);
    window.addEventListener("touchend", handleCallback);

    return () => {
      window.removeEventListener("mouseup", handleCallback);
      window.removeEventListener("touchend", handleCallback);
    };
  }, [callback]);

  return ref;
};

export default useClickOutside;