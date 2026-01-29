import { Router } from "../shared/http";
import { getSecret } from "../shared/infra/config/secrets";

// --- INFRA: Database Repositories (Isolados) ---
import { PostgresUserRepository } from "./infra/database/postgres/repositories/PostgresUserRepository";
import { PostgresRoleRepository } from "./infra/database/postgres/repositories/PostgresRoleRepository";
import { PostgresPermissionRepository } from "./infra/database/postgres/repositories/PostgresPermissionRepository";
import { PostgresTokenRepository } from "./infra/database/postgres/repositories/PostgresTokenRepository";
import { PostgresRecoveryRepository } from "./infra/database/postgres/repositories/PostgresRecoveryRepository";

// --- INFRA: Native Bun Providers (Isolados) ---
import { BunJwtProvider } from "./infra/providers/bun/BunJwtProvider";
import { BunPasswordHasher } from "./infra/providers/bun/BunPasswordHasher";
import { EventBus } from "../shared/domain/events/EventBus.protocol";

// --- DOMAIN SERVICES ---
import { UserManagerService } from "./domain/services/user-manager.service";
import { RoleManagerService } from "./domain/services/role-manager.service";

// --- APPLICATION: UseCases ---
// Auth
import { LoginUseCase } from "./application/useCases/Login.useCase";
import { RefreshTokenUseCase } from "./application/useCases/RefreshToken.useCase";
import { ForgotPasswordUseCase } from "./application/useCases/ForgotPassword.useCase";
import { ResetPasswordUseCase } from "./application/useCases/ResetPassword.useCase";

// User
import { CreateUserUseCase } from "./application/useCases/CreateUser.useCase";
import { ListUsersUseCase } from "./application/useCases/ListUsers.useCase";
import { GetUserProfileUseCase } from "./application/useCases/GetUserProfile.useCase";
import { UpdateUserUseCase } from "./application/useCases/UpdateUser.useCase";
import { ToggleUserStatusUseCase } from "./application/useCases/ToggleUserStatus.useCase";
import { ChangeUserRoleUseCase } from "./application/useCases/ChangeUserRole.useCase";

// Role
import { CreateRoleUseCase } from "./application/useCases/CreateRole.useCase";
import { ListRolesUseCase } from "./application/useCases/ListRoles.useCase";
import { UpdateRoleUseCase } from "./application/useCases/UpdateRole.useCase";
import { DeleteRoleUseCase } from "./application/useCases/DeleteRole.useCase";

// Permission
import { ListPermissionsUseCase } from "./application/useCases/ListPermissions.useCase";

// --- ROUTES ---
import { registerIamRoutes } from "./infra/http/bun-server/routes";

export function createIamModule(router: Router, eventBus: EventBus) {
  // 1. Configuração Isolada do Módulo
  const jwtSecret = getSecret("JWT_SECRET");
  if (!jwtSecret) throw new Error("[IAM] JWT_SECRET is missing!");

  // 2. Infraestrutura (Dedicated Instances)
  const userRepo = new PostgresUserRepository();
  const roleRepo = new PostgresRoleRepository();
  const permissionRepo = new PostgresPermissionRepository();
  const tokenRepo = new PostgresTokenRepository();
  const recoveryRepo = new PostgresRecoveryRepository();

  const jwtProvider = new BunJwtProvider(jwtSecret);
  const passwordHasher = new BunPasswordHasher();
  
  // 3. Domain Services
  const userManagerService = new UserManagerService(userRepo, roleRepo);
  const roleManagerService = new RoleManagerService(roleRepo, userRepo);

  // 4. Application (UseCases)

  // Auth
  const loginUseCase = new LoginUseCase(userRepo, tokenRepo, passwordHasher, jwtProvider, eventBus);
  const refreshUseCase = new RefreshTokenUseCase(userRepo, tokenRepo, jwtProvider);
  const forgotUseCase = new ForgotPasswordUseCase(userRepo, recoveryRepo, eventBus);
  const resetUseCase = new ResetPasswordUseCase(userRepo, recoveryRepo, tokenRepo, passwordHasher, eventBus);

  // User
  const createUserUseCase = new CreateUserUseCase(userRepo, roleRepo, passwordHasher, eventBus);
  const listUsersUseCase = new ListUsersUseCase(userRepo);
  const getUserProfileUseCase = new GetUserProfileUseCase(userRepo);
  const updateUserUseCase = new UpdateUserUseCase(userRepo, eventBus);
  const toggleUserStatusUseCase = new ToggleUserStatusUseCase(userRepo, tokenRepo, userManagerService, eventBus);
  const changeUserRoleUseCase = new ChangeUserRoleUseCase(userRepo, roleRepo, tokenRepo, userManagerService, eventBus);

  // Role
  const createRoleUseCase = new CreateRoleUseCase(roleRepo, roleManagerService, eventBus);
  const listRolesUseCase = new ListRolesUseCase(roleRepo);
  const updateRoleUseCase = new UpdateRoleUseCase(roleRepo, userRepo, tokenRepo, roleManagerService, eventBus);
  const deleteRoleUseCase = new DeleteRoleUseCase(roleRepo, roleManagerService);

  // Permission
  const listPermissionsUseCase = new ListPermissionsUseCase(permissionRepo);

  // 5. Registro de Rotas
  registerIamRoutes(router, {
    // Auth
    loginUseCase,
    refreshTokenUseCase: refreshUseCase,
    forgotPasswordUseCase: forgotUseCase,
    resetPasswordUseCase: resetUseCase,
    
    // User
    createUserUseCase,
    listUsersUseCase,
    getUserProfileUseCase,
    updateUserUseCase,
    toggleUserStatusUseCase,
    changeUserRoleUseCase,

    // Role
    createRoleUseCase,
    listRolesUseCase,
    updateRoleUseCase,
    deleteRoleUseCase,

    // Permission
    listPermissionsUseCase
  });
}