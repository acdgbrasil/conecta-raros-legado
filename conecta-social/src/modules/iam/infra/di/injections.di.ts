import { LoginUseCase } from "@modules/iam/application/useCases/Login.useCase";
import { GetIt } from "@modules/shared/infra/di/get_it/get_it";
import { PostgresUserRepository } from "../database/postgres/repositories/PostgresUserRepository";
import { PostgresTokenRepository } from "../database/postgres/repositories/PostgresTokenRepository";
import { BunPasswordHasher } from "@modules/shared/infra/providers/password/BunPasswordHasher";
import { BunJwtProvider } from "../providers/bun/BunJwtProvider";
import { getSecret } from "@modules/shared/infra/config/secrets";
import { BunEventBus } from "../providers/bun/BunEventBus";
import { RefreshTokenUseCase } from "@modules/iam/application/useCases/RefreshToken.useCase";

export const InjectionsTokens = {
  loginUseCase: "IAM:LoginUseCase",
  refreshTokenUseCase: "IAM:RefreshTokenUseCase"
}


export const initializeInjections = async () => {

  const config = getSecret("JWT_SECRET");
  const userRepository = new PostgresUserRepository();
  const tokenRepository = new PostgresTokenRepository();
  const passwordHasher = new BunPasswordHasher();
  const jwtService = new BunJwtProvider(config);
  const eventBus = new BunEventBus();

  const loginUseCase = new LoginUseCase(
    userRepository,
    tokenRepository,
    passwordHasher,
    jwtService,
    eventBus
  );

  const refreshTokenUseCase = new RefreshTokenUseCase(
    userRepository,
    tokenRepository,
    jwtService
  );

  const getIt = GetIt.instance;
  getIt.registerSingleton<LoginUseCase>(InjectionsTokens.loginUseCase, loginUseCase);
  getIt.registerSingleton<RefreshTokenUseCase>(InjectionsTokens.refreshTokenUseCase, refreshTokenUseCase);
  
};