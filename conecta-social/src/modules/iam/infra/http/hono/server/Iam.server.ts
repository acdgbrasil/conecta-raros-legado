import { Hono } from "hono";
import { UserPostgresRepository } from "../../../database/postgres/services/UserPostgres.service";
import { TokenPostgresRepository } from "../../../database/postgres/services/TokenPostgres.service";
import { RecoveryPostgresRepository } from "../../../database/postgres/services/RecoveryPostgres.service";
import { NotificationPostgresRepository } from "../../../../../notifications/infra/database/postgres/services/NotificationPostgres.service";
import { ConsoleNotificationProvider } from "../../../../../notifications/infra/providers/ConsoleNotificationProvider";
import { NotificationDispatcher } from "../../../../../notifications/infra/providers/NotificationDispatcher.service";
import { HonoJwtService } from "../jwt/HonoJwt.service";
import { globalEventBus } from "../../../../../shared/infra/eventBus/InMemoryEventBus";
import { authMiddleware, requirePermission } from "../middleware/Auth.middleware";

// UseCases
import { LoginUseCase } from "../../../../application/useCases/Login.useCase";
import { RefreshTokenUseCase } from "../../../../application/useCases/RefreshToken.useCase";
import { ForgotPasswordUseCase } from "../../../../application/useCases/ForgotPassword.useCase";
import { ResetPasswordUseCase } from "../../../../application/useCases/ResetPassword.useCase";
import { CreateUserUseCase } from "../../../../application/useCases/CreateUser.useCase";
import { ListUsersUseCase } from "../../../../application/useCases/ListUsers.useCase";
import { ChangeUserRoleUseCase } from "../../../../application/useCases/ChangeUserRole.useCase";
import { UpdateUserStatusUseCase } from "../../../../application/useCases/UpdateUserStatus.useCase";
import { UpdateUserUseCase } from "../../../../application/useCases/UpdateUser.useCase";
import { GetUserProfileUseCase } from "../../../../application/useCases/GetUserProfile.useCase";
import { SendNotificationUseCase } from "../../../../../notifications/application/useCases/SendNotification.useCase";

// Handlers
import { PasswordRecoveryHandler } from "../../../../../notifications/application/handlers/PasswordRecovery.handler";
import { UserCreatedHandler } from "../../../../../notifications/application/handlers/UserCreated.handler";

// Controller
import { AuthController } from "../controllers/Auth.Controller";

export const IamServer = () => {
  const app = new Hono();

  // --- INFRA ---
  const userRepo = new UserPostgresRepository();
  const tokenRepo = new TokenPostgresRepository();
  const recoveryRepo = new RecoveryPostgresRepository();
  const notificationRepo = new NotificationPostgresRepository();
  const jwtProvider = new HonoJwtService();
  const eventBus = globalEventBus;

  // --- NOTIFICATIONS SETUP ---
  const consoleProvider = new ConsoleNotificationProvider();
  const dispatcher = new NotificationDispatcher([consoleProvider]); 
  const sendNotificationUseCase = new SendNotificationUseCase(notificationRepo, dispatcher);

  // --- EVENT HANDLERS ---
  const passwordRecoveryHandler = new PasswordRecoveryHandler(sendNotificationUseCase);
  const userCreatedHandler = new UserCreatedHandler(sendNotificationUseCase);
  
  eventBus.subscribe('PasswordRecoveryRequested', passwordRecoveryHandler);
  eventBus.subscribe('UserCreated', userCreatedHandler);

  // --- IAM USE CASES ---
  const loginUseCase = new LoginUseCase(userRepo, tokenRepo, jwtProvider);
  const refreshUseCase = new RefreshTokenUseCase(userRepo, tokenRepo, jwtProvider);
  const forgotUseCase = new ForgotPasswordUseCase(userRepo, recoveryRepo, eventBus);
  const resetUseCase = new ResetPasswordUseCase(recoveryRepo, userRepo, tokenRepo);
  const createUserUseCase = new CreateUserUseCase(userRepo, eventBus);
  const listUsersUseCase = new ListUsersUseCase(userRepo);
  const changeRoleUseCase = new ChangeUserRoleUseCase(userRepo, tokenRepo);
  const updateStatusUseCase = new UpdateUserStatusUseCase(userRepo, tokenRepo);
  const updateUserUseCase = new UpdateUserUseCase(userRepo);
  const getProfileUseCase = new GetUserProfileUseCase(userRepo);

  // --- CONTROLLER ---
  const authController = new AuthController(
    loginUseCase, 
    refreshUseCase, 
    forgotUseCase, 
    resetUseCase,
    createUserUseCase,
    listUsersUseCase,
    changeRoleUseCase,
    updateStatusUseCase,
    updateUserUseCase,
    getProfileUseCase
  );

  // --- PUBLIC ROUTES ---
  app.post("/auth/login", (c) => authController.login(c));
  app.post("/auth/refresh", (c) => authController.refresh(c));
  app.post("/auth/forgot-password", (c) => authController.forgotPassword(c));
  app.post("/auth/reset-password", (c) => authController.resetPassword(c));

  // --- PROTECTED ROUTES ---
  
  // Perfil (Apenas Auth)
  app.get("/users/me",
    authMiddleware(jwtProvider),
    (c) => authController.getProfile(c)
  );

  // Gestão de Usuários
  app.post("/users", 
    authMiddleware(jwtProvider), 
    requirePermission('users:write'), 
    (c) => authController.createUser(c)
  );

  app.get("/users", 
    authMiddleware(jwtProvider), 
    requirePermission('users:read'), 
    (c) => authController.listUsers(c)
  );

  app.put("/users/:id", 
    authMiddleware(jwtProvider), 
    requirePermission('users:write'), 
    (c) => authController.updateUser(c)
  );

  // Administração
  app.patch("/users/:id/role",
    authMiddleware(jwtProvider),
    requirePermission('users:promote'),
    (c) => authController.changeUserRole(c)
  );

  app.patch("/users/:id/status",
    authMiddleware(jwtProvider),
    requirePermission('users:block'),
    (c) => authController.updateUserStatus(c)
  );
  
  return app;
}
