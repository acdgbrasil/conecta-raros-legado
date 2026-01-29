import { Router } from "../shared/http";
import { getSecret } from "../shared/infra/config/secrets";

// --- INFRA: Database Repositories (Isolados) ---
import { PostgresUserRepository } from "./infra/database/postgres/repositories/PostgresUserRepository";
import { PostgresTokenRepository } from "./infra/database/postgres/repositories/PostgresTokenRepository";
import { PostgresRecoveryRepository } from "./infra/database/postgres/repositories/PostgresRecoveryRepository";
// --- INFRA: Native Bun Providers (Isolados) ---
import { BunJwtProvider } from "./infra/providers/bun/BunJwtProvider";
import { BunPasswordHasher } from "./infra/providers/bun/BunPasswordHasher";
import { EventBus } from "../shared/domain/events/EventBus.protocol";

// --- APPLICATION: UseCases ---
import { LoginUseCase } from "./application/useCases/Login.useCase";
import { RefreshTokenUseCase } from "./application/useCases/RefreshToken.useCase";
import { ForgotPasswordUseCase } from "./application/useCases/ForgotPassword.useCase";
import { ResetPasswordUseCase } from "./application/useCases/ResetPassword.useCase";

// --- ROUTES ---
import { registerIamRoutes } from "./infra/http/bun-server/routes";

export function createIamModule(router: Router, eventBus: EventBus) {
  // 1. Configuração Isolada do Módulo
  const jwtSecret = getSecret("JWT_SECRET");
  if (!jwtSecret) throw new Error("[IAM] JWT_SECRET is missing!");

  // 2. Infraestrutura (Dedicated Instances)
  const userRepo = new PostgresUserRepository();
  const tokenRepo = new PostgresTokenRepository();
  const recoveryRepo = new PostgresRecoveryRepository();

  const jwtProvider = new BunJwtProvider(jwtSecret);
  const passwordHasher = new BunPasswordHasher();
  // const eventBus = new BunEventBus(); // Injetado de fora para comunicação inter-módulo

  // 3. Application (UseCases)
  const loginUseCase = new LoginUseCase(userRepo, tokenRepo, passwordHasher, jwtProvider, eventBus);
  const refreshUseCase = new RefreshTokenUseCase(userRepo, tokenRepo, jwtProvider);
  const forgotUseCase = new ForgotPasswordUseCase(userRepo, recoveryRepo, eventBus);
  const resetUseCase = new ResetPasswordUseCase(userRepo, recoveryRepo, tokenRepo, passwordHasher, eventBus);

  // 4. Registro de Rotas
  registerIamRoutes(router, {
    loginUseCase,
    refreshTokenUseCase: refreshUseCase,
    forgotPasswordUseCase: forgotUseCase,
    resetPasswordUseCase: resetUseCase
  });
}
