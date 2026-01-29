import type { Handler } from "../../../../../shared/http";
import { LoginUseCase } from "../../../../application/useCases/Login.useCase";
import { RefreshTokenUseCase } from "../../../../application/useCases/RefreshToken.useCase";
import { ForgotPasswordUseCase } from "../../../../application/useCases/ForgotPassword.useCase";
import { ResetPasswordUseCase } from "../../../../application/useCases/ResetPassword.useCase";

// Mappers (ACL) - Importando inputs da camada de aplicação
import { LoginSchema } from "../../../../application/mappers/auth/inputs/Login.input";
import { RefreshTokenSchema } from "../../../../application/mappers/auth/inputs/RefreshToken.input";
import { ForgotPasswordSchema } from "../../../../application/mappers/auth/inputs/ForgotPassword.input";
import { ResetPasswordSchema } from "../../../../application/mappers/auth/inputs/ResetPassword.input";

// --- Factories de Handlers ---

/**
 * POST /auth/login
 */
export const makeLoginHandler = (useCase: LoginUseCase): Handler => async (ctx) => {
  const body = await ctx.parseBody(LoginSchema);
  const result = await useCase.execute(body);
  return ctx.json(result);
};

/**
 * POST /auth/refresh
 */
export const makeRefreshHandler = (useCase: RefreshTokenUseCase): Handler => async (ctx) => {
  const body = await ctx.parseBody(RefreshTokenSchema);
  const result = await useCase.execute(body);
  return ctx.json(result);
};

/**
 * POST /auth/forgot-password
 */
export const makeForgotHandler = (useCase: ForgotPasswordUseCase): Handler => async (ctx) => {
  const body = await ctx.parseBody(ForgotPasswordSchema);
  const result = await useCase.execute(body);
  return ctx.json(result);
};

/**
 * POST /auth/reset-password
 */
export const makeResetHandler = (useCase: ResetPasswordUseCase): Handler => async (ctx) => {
  const body = await ctx.parseBody(ResetPasswordSchema);
  const result = await useCase.execute(body);
  return ctx.json(result);
};
