import React, { RefObject, useState } from "react";

const useKeyPress = function (targetKey: string, ref: RefObject<HTMLInputElement>, callback: () => void) {
  const [keyPressed, setKeyPressed] = useState(false);

  function downHandler({ key }: { key: string }) {
    if (key === targetKey) {
      setKeyPressed(true);
      callback();
    }
  }

  const upHandler = (data: { key: string }) => {
    if (data.key === targetKey) {
      setKeyPressed(false);
    }
  };

  React.useEffect(() => {
    ref.current?.addEventListener("keydown", downHandler);
    ref.current?.addEventListener("keyup", upHandler);

    return () => {
      ref.current?.removeEventListener("keydown", downHandler);
      ref.current?.removeEventListener("keyup", upHandler);
    };
  });

  return keyPressed;
};

export default useKeyPress;
