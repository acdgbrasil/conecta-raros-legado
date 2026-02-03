import { BunRequest } from "bun";
import { RouterHandler } from "../../../types/types";
import { RefreshTokenUseCase } from "@modules/iam/application/useCases/RefreshToken.useCase";
import { AuthMapper } from "@modules/iam/application/mappers/auth/Auth.mapper";
import { GetIt } from "@modules/shared/infra/di/get_it/get_it";
import { authHttpErrorMapper } from "@modules/iam/application/mappers/auth/error/auth.error";

export const refreshMobileController: RouterHandler = async (req:BunRequest): Promise<Response> => {
  try {
    const { refreshToken } = await req.json();
    const refreshParsed = AuthMapper.validateRefresh({ refreshToken });
    const refreshTokenUseCase = GetIt.instance.get<RefreshTokenUseCase>("IAM:RefreshTokenUseCase");
    const refreshResponse = await refreshTokenUseCase.execute(refreshParsed);
    const jsonResponse = AuthMapper.toRefreshResponse(refreshResponse);
    const { body, init } = AuthMapper.response.okNoStore(jsonResponse);
    return Response.json(body, init);
  }catch (error) {
    const { body, init } = authHttpErrorMapper(error);
    return Response.json(body, init);
  }
}