import { LoginUseCase } from "@modules/iam/application/useCases/Login.useCase";
import { Router } from "../../../../shared/http";

// Factories de Handlers
import * as AuthController from "./controllers/auth.controller";
import { RefreshTokenUseCase } from "@modules/iam/application/useCases/RefreshToken.useCase";
import { ForgotPasswordUseCase } from "@modules/iam/application/useCases/ForgotPassword.useCase";
import { ResetPasswordUseCase } from "@modules/iam/application/useCases/ResetPassword.useCase";
// import * as UserController from "./controllers/user.controller"; // Foco em Auth por enquanto

// UseCases Imports

type Dependencies = {
  // Auth UseCases
  loginUseCase: LoginUseCase;
  refreshTokenUseCase: RefreshTokenUseCase;
  forgotPasswordUseCase: ForgotPasswordUseCase;
  resetPasswordUseCase: ResetPasswordUseCase;
  
  // User UseCases (Placeholder para futuro)
  // ...
};

export const registerIamRoutes = (router: Router, deps: Dependencies) => {
  // --- AUTH ROUTES ---
  
  // 1. Login
  router.register("POST", "/auth/login", AuthController.makeLoginHandler(deps.loginUseCase));

  // 2. Refresh Token
  router.register("POST", "/auth/refresh", AuthController.makeRefreshHandler(deps.refreshTokenUseCase));

  // 3. Forgot Password
  router.register("POST", "/auth/forgot-password", AuthController.makeForgotHandler(deps.forgotPasswordUseCase));

  // 4. Reset Password
  router.register("POST", "/auth/reset-password", AuthController.makeResetHandler(deps.resetPasswordUseCase));
};