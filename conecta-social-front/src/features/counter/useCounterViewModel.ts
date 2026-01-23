import { useState } from "react";

export function useCounterViewModel() {
  // Model logic (State)
  const [count, setCount] = useState(0);

  // ViewModel Methods (Actions)
  const increment = () => {
    setCount(count + 1);
  };

  return {
    count,
    increment
  };
}
