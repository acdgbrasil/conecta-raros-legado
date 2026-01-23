"use client";

import { useCounterViewModel } from "./useCounterViewModel";
import styles from "./Counter.module.css";

export default function Counter() {
  const { count, increment } = useCounterViewModel();
  return (
    <button className={styles.increment} onClick={increment} type="button">
      Clicks: {count}
    </button>
  );
}
