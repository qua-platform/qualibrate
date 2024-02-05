import { useEffect, useRef } from "react";

export default function useResize(handler: (event: HTMLElementEventMap["resize"]) => void): void {
  const savedHandler = useRef(handler);

  useEffect(() => {
    savedHandler.current = handler;
  }, [handler]);

  useEffect(() => {
    // Define the listening target
    const targetElement: Window = window;
    if (!(targetElement && targetElement.addEventListener)) {
      return;
    }

    // Create event listener that calls handler function stored in ref
    const eventListener: typeof handler = (event) => savedHandler.current(event);

    targetElement.addEventListener("resize", eventListener);

    // Remove event listener on cleanup
    return () => {
      targetElement.removeEventListener("resize", eventListener);
    };
  }, []);
}
