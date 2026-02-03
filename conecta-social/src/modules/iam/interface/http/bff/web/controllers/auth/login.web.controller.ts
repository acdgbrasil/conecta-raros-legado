import { BunRequest } from "bun";
import { authHttpErrorMapper } from "@modules/iam/application/mappers/auth/error/auth.error";
import { AuthMapper } from "@modules/iam/application/mappers/auth/Auth.mapper";
import { GetIt } from "@modules/shared/infra/di/get_it/get_it";
import { LoginUseCase } from "@modules/iam/application/useCases/Login.useCase";
import { TimeInSeconds } from "@modules/shared/constants/TimeInSeconds.constants";
import { RouterHandler } from "../../../../types/types";
import { InjectionsTokens } from "@modules/iam/infra/di/injections.di";

const REFRESH_COOKIE_NAME = "__Host-refresh_token";

// Helper para serializar cookie de forma segura e compatível com Bun Native
const serializeCookie = (name: string, value: string, maxAge: number) => {
  return `${name}=${value}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${maxAge}`;
};

export const loginWebController: RouterHandler = async (req: BunRequest): Promise<Response> => {
  try {
    const { email, password } = await req.json();
    
    const loginParsed = AuthMapper.validateLogin({ email, password });
    const loginUseCase = GetIt.instance.get<LoginUseCase>(InjectionsTokens.loginUseCase);
    const loginResponse = await loginUseCase.execute(loginParsed);
    
    const jsonResponse = AuthMapper.toLoginResponse(loginResponse);
    const { accessToken, refreshToken, user } = jsonResponse;
    const { body, init } = AuthMapper.response.okNoStore({ accessToken, user });
    const cookieHeader = serializeCookie(REFRESH_COOKIE_NAME, refreshToken, TimeInSeconds.THIRTY_DAYS);
    
    if (init.headers instanceof Headers) {
      init.headers.append("Set-Cookie", cookieHeader);
    } else {
      // Fallback de segurança
      init.headers = new Headers(init.headers);
      (init.headers as Headers).append("Set-Cookie", cookieHeader);
    }

    return Response.json(body, init);
  } catch (error) {
    const { body, init } = authHttpErrorMapper(error);
    return Response.json(body, init);
  }
}