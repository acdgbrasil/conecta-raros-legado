import { createSignal } from "solid-js";
import { loginAction } from "../../server/auth.actions";

export const enum AuthViewModelStatus {
  IDLE = "IDLE",
  LOADING = "LOADING",
  ERROR = "ERROR",
  SUCCESS = "SUCCESS"
}

export function useAuthViewModel() {
  const [status, setStatus] = createSignal<AuthViewModelStatus>(AuthViewModelStatus.IDLE);
  const [errorMessage, setErrorMessage] = createSignal<string | null>(null);

  const login = async (email: string, password: string) => {
    setStatus(AuthViewModelStatus.LOADING);
    setErrorMessage(null);

    try {
      const user = await loginAction({ email, password });
      setStatus(AuthViewModelStatus.SUCCESS);
      return user;
    } catch (error: any) {
      setStatus(AuthViewModelStatus.ERROR);
      setErrorMessage(error.message || "Erro desconhecido");
    }
  };

  return {
    status,
    errorMessage,
    login
  };
}