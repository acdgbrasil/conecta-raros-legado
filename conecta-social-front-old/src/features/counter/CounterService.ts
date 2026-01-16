import { CounterData } from "./CounterModel";

// Exemplo de Service (API Call)
export const CounterService = {
  async fetchInitialCount(): Promise<CounterData> {
    // Simula um fetch
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ value: 10, lastUpdated: new Date() });
      }, 500);
    });
  }
};
