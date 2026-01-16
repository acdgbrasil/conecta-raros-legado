"use server";

import { setCookie } from "vinxi/http";
import { AuthModel, LoginResponse } from "../models/auth.model";
import { HttpClient } from "~/shared/services/api/apiClient";
import { ApiRoutes } from "~/shared/models/api-routes.model";

const FIFTEEN_DAYS_IN_SECONDS = 15 * 24 * 60 * 60;

export async function loginAction(props: AuthModel) {
  try {
    // HttpClient já injeta a BASE_URL automaticamente
    const response = await HttpClient.post<LoginResponse>(ApiRoutes.AUTH_LOGIN, props);

    setCookie("auth_token", response.token, {
      httpOnly: true,
      secure: import.meta.env.PROD,
      sameSite: "strict",
      path: "/",
      maxAge: FIFTEEN_DAYS_IN_SECONDS,
    });

    return response.user;
  } catch (error: any) {
    throw new Error(error.message || "Falha na autenticação");
  }
}
