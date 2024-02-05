import { useState } from "react";

type Hook = {
  increase: (v?: number) => void;
  decrease: (v?: number) => void;
  setLimit: (l: number) => void;
  counter: number;
};

const useLoopedCounter = (value = 0, maxValue = 1): Hook => {
  const [counter, setCounter] = useState<number>(value);
  const [limit, setLimit] = useState<number>(maxValue);

  const increase = (v = 1) => {
    const value = typeof v === "number" ? v : 1;

    setCounter((previousValue: number) => {
      if (previousValue + value > limit) {
        return 0;
      }

      return previousValue + value;
    });
  };

  const decrease = (v = 1) => {
    const value = typeof v === "number" ? v : 1;
    setCounter((previousValue: number) => {
      if (previousValue - value < 0) {
        return limit;
      }

      return previousValue - value;
    });
  };

  return { increase, decrease, setLimit, counter };
};

export default useLoopedCounter;
