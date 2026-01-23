"use server";

import { cookies } from "next/headers";
import { AuthModel, LoginResponse } from "../models/auth.model";
import { HttpClient } from "@/shared/services/api/apiClient";
import { ApiRoutes } from "@/shared/models/api-routes.model";

const FIFTEEN_DAYS_IN_SECONDS = 15 * 24 * 60 * 60;

export async function loginAction(props: AuthModel) {
  try {
    const response = await HttpClient.post<LoginResponse>(ApiRoutes.AUTH_LOGIN, props);

    const cookieStore = await cookies();
    cookieStore.set("auth_token", response.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: FIFTEEN_DAYS_IN_SECONDS,
    });

    return response.user;
  } catch (error: any) {
    throw new Error(error.message || "Falha na autenticação");
  }
}
