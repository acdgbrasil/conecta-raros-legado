import { BunRequest } from "bun";
import { AuthMapper } from "@modules/iam/application/mappers/auth/Auth.mapper";
import { GetIt } from "@modules/shared/infra/di/get_it/get_it";
import { authHttpErrorMapper } from "@modules/iam/application/mappers/auth/error/auth.error";
import { RefreshTokenUseCase } from "@modules/iam/application/useCases/RefreshToken.useCase";
import { TimeInSeconds } from "@modules/shared/constants/TimeInSeconds.constants";
import { RouterHandler } from "../../../../types/types";
import { InjectionsTokens } from "@modules/iam/infra/di/injections.di";

const REFRESH_COOKIE_NAME = "__Host-refresh_token";

const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: true,
  sameSite: "strict",
  path: "/",
  maxAge: TimeInSeconds.THIRTY_DAYS
} as const;

export const refreshWebController: RouterHandler = async (req:BunRequest): Promise<Response> => {
  try {
    const refreshToken = req.cookies.get(REFRESH_COOKIE_NAME);
    const refreshParsed = AuthMapper.validateRefresh({ refreshToken });
    const refreshTokenUseCase = GetIt.instance.get<RefreshTokenUseCase>(InjectionsTokens.refreshTokenUseCase);
    const refreshResponse = await refreshTokenUseCase.execute(refreshParsed);
    const { accessToken, refreshToken: rotatedRefreshToken } = AuthMapper.toRefreshResponse(refreshResponse);

    req.cookies.set(REFRESH_COOKIE_NAME, rotatedRefreshToken, REFRESH_COOKIE_OPTIONS);

    const { body, init } = AuthMapper.response.okNoStore({ accessToken });
    return Response.json(body, init);
  } catch (error) {
    const { body, init } = authHttpErrorMapper(error);
    return Response.json(body, init);
  }
};
