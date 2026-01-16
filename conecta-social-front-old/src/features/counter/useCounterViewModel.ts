import { createSignal } from "solid-js";

export function useCounterViewModel() {
  // Model logic (State)
  const [count, setCount] = createSignal(0);

  // ViewModel Methods (Actions)
  const increment = () => {
    setCount(count() + 1);
  };

  return {
    count,
    increment
  };
}
