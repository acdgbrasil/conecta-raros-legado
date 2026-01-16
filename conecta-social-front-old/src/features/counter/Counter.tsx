import { useCounterViewModel } from "./useCounterViewModel";
import "./Counter.css";

export default function Counter() {
  const { count, increment } = useCounterViewModel();
  return (
    <button class="increment" onClick={increment} type="button">
      Clicks: {count()}
    </button>
  );
}
