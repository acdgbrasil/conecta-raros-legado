import { BunRequest } from "bun";
import { RouterHandler } from "../../../types/types";
import { AuthMapper } from "@modules/iam/application/mappers/auth/Auth.mapper";
import { LoginUseCase } from "@modules/iam/application/useCases/Login.useCase";
import { GetIt } from "@modules/shared/infra/di/get_it/get_it";
import { authHttpErrorMapper } from "@modules/iam/application/mappers/auth/error/auth.error";

export const loginMobileController: RouterHandler = async (req:BunRequest): Promise<Response> => {
  try {
    const { email, password } = await req.json();
    const loginParsed = AuthMapper.validateLogin({ email, password });
    const loginUseCase = GetIt.instance.get<LoginUseCase>("IAM:LoginUseCase");
    const loginResponse = await loginUseCase.execute(loginParsed);
    const jsonResponse = AuthMapper.toLoginResponse(loginResponse);
    const { body, init } = AuthMapper.response.okNoStore(jsonResponse);
    return Response.json(body, init);
  }catch (error) {
    const { body, init } = authHttpErrorMapper(error);
    return Response.json(body, init);
  }
}