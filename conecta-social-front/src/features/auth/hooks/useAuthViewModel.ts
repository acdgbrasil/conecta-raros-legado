import { useState } from "react";
import { AuthService } from "../service/auth.service";

export enum AuthViewModelStatus {
  IDLE = "IDLE",
  LOADING = "LOADING",
  ERROR = "ERROR",
  SUCCESS = "SUCCESS"
}

export function useAuthViewModel() {
  const [status, setStatus] = useState<AuthViewModelStatus>(AuthViewModelStatus.IDLE);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const login = async (email: string, password: string) => {
    const authService = AuthService();
    setStatus(AuthViewModelStatus.LOADING);
    setErrorMessage(null);

    try {
      await authService.Login({ email, password });
      setStatus(AuthViewModelStatus.SUCCESS);
      return
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Erro desconhecido";
      setStatus(AuthViewModelStatus.ERROR);
      setErrorMessage(message);
    }
  };

  return {
    status,
    errorMessage,
    login
  };
}
