import { LoginUseCase } from "@modules/iam/application/useCases/Login.useCase";
import { Router, stack } from "../../../../shared/http"; // Import stack

// Middlewares
import { withAuth, requirePermission } from "./middleware/auth.middleware";
import { PermissionMapper } from "@modules/iam/application/mappers/permission/Permission.mapper";

// Factories de Handlers
import * as AuthController from "./controllers/auth.controller";
import * as UserController from "./controllers/user.controller";
import * as RoleController from "./controllers/role.controller";
import * as PermissionController from "./controllers/permission.controller";

import { RefreshTokenUseCase } from "@modules/iam/application/useCases/RefreshToken.useCase";
import { ForgotPasswordUseCase } from "@modules/iam/application/useCases/ForgotPassword.useCase";
import { ResetPasswordUseCase } from "@modules/iam/application/useCases/ResetPassword.useCase";

// User UseCases
import { CreateUserUseCase } from "@modules/iam/application/useCases/CreateUser.useCase";
import { ListUsersUseCase } from "@modules/iam/application/useCases/ListUsers.useCase";
import { GetUserProfileUseCase } from "@modules/iam/application/useCases/GetUserProfile.useCase";
import { UpdateUserUseCase } from "@modules/iam/application/useCases/UpdateUser.useCase";
import { ToggleUserStatusUseCase } from "@modules/iam/application/useCases/ToggleUserStatus.useCase";
import { ChangeUserRoleUseCase } from "@modules/iam/application/useCases/ChangeUserRole.useCase";

// Role UseCases
import { CreateRoleUseCase } from "@modules/iam/application/useCases/CreateRole.useCase";
import { ListRolesUseCase } from "@modules/iam/application/useCases/ListRoles.useCase";
import { UpdateRoleUseCase } from "@modules/iam/application/useCases/UpdateRole.useCase";
import { DeleteRoleUseCase } from "@modules/iam/application/useCases/DeleteRole.useCase";

// Permission UseCases
import { ListPermissionsUseCase } from "@modules/iam/application/useCases/ListPermissions.useCase";

// Providers (Necessário para o middleware)
import { JwtProvider } from "@modules/shared/domain/services/JwtProvider.protocol";

// UseCases Imports

type Dependencies = {
  // Auth UseCases
  loginUseCase: LoginUseCase;
  refreshTokenUseCase: RefreshTokenUseCase;
  forgotPasswordUseCase: ForgotPasswordUseCase;
  resetPasswordUseCase: ResetPasswordUseCase;
  
  // User UseCases
  createUserUseCase: CreateUserUseCase;
  listUsersUseCase: ListUsersUseCase;
  getUserProfileUseCase: GetUserProfileUseCase;
  updateUserUseCase: UpdateUserUseCase;
  toggleUserStatusUseCase: ToggleUserStatusUseCase;
  changeUserRoleUseCase: ChangeUserRoleUseCase;

  // Role UseCases
  createRoleUseCase: CreateRoleUseCase;
  listRolesUseCase: ListRolesUseCase;
  updateRoleUseCase: UpdateRoleUseCase;
  deleteRoleUseCase: DeleteRoleUseCase;

  // Permission UseCases
  listPermissionsUseCase: ListPermissionsUseCase;

  // Providers
  jwtProvider: JwtProvider;
};

export const registerIamRoutes = (router: Router, deps: Dependencies) => {
  const { IAM_PERMISSIONS: P } = PermissionMapper;
  const auth = withAuth(deps.jwtProvider); // Helper para encurtar

  // --- AUTH ROUTES ---
  // Rotas Públicas
  router.register("POST", "/auth/login", AuthController.makeLoginHandler(deps.loginUseCase));
  router.register("POST", "/auth/refresh", AuthController.makeRefreshHandler(deps.refreshTokenUseCase));
  router.register("POST", "/auth/forgot-password", AuthController.makeForgotHandler(deps.forgotPasswordUseCase));
  router.register("POST", "/auth/reset-password", AuthController.makeResetHandler(deps.resetPasswordUseCase));

  // --- USER ROUTES ---
  
  // Create User -> [Auth + P.USERS.CREATE]
  router.register("POST", "/users", stack(
    [auth, requirePermission(P.USERS.CREATE)],
    UserController.makeCreateUserHandler(deps.createUserUseCase)
  ));

  // List Users -> [Auth + P.USERS.READ]
  router.register("GET", "/users", stack(
    [auth, requirePermission(P.USERS.READ)],
    UserController.makeListUsersHandler(deps.listUsersUseCase)
  ));

  // Get Profile -> [Auth] (Sem permissão específica, qualquer logado vê o seu)
  router.register("GET", "/users/me", stack(
    [auth],
    UserController.makeGetProfileHandler(deps.getUserProfileUseCase)
  ));

  // Update User -> [Auth + P.USERS.UPDATE]
  router.register("PUT", "/users/:id", stack(
    [auth, requirePermission(P.USERS.UPDATE)],
    UserController.makeUpdateUserHandler(deps.updateUserUseCase)
  ));

  // Toggle Status -> [Auth + P.USERS.STATUS]
  router.register("PATCH", "/users/:id/status", stack(
    [auth, requirePermission(P.USERS.STATUS)],
    UserController.makeToggleStatusHandler(deps.toggleUserStatusUseCase)
  ));

  // Change Role -> [Auth + P.ROLES.ASSIGN]
  router.register("PATCH", "/users/:id/role", stack(
    [auth, requirePermission(P.ROLES.ASSIGN)],
    UserController.makeChangeRoleHandler(deps.changeUserRoleUseCase)
  ));

  // --- ROLE ROUTES ---

  // Create Role -> [Auth + P.ROLES.CREATE]
  router.register("POST", "/roles", stack(
    [auth, requirePermission(P.ROLES.CREATE)],
    RoleController.makeCreateRoleHandler(deps.createRoleUseCase)
  ));

  // List Roles -> [Auth + P.ROLES.READ]
  router.register("GET", "/roles", stack(
    [auth, requirePermission(P.ROLES.READ)],
    RoleController.makeListRolesHandler(deps.listRolesUseCase)
  ));

  // Update Role -> [Auth + P.ROLES.UPDATE]
  router.register("PUT", "/roles/:id", stack(
    [auth, requirePermission(P.ROLES.UPDATE)],
    RoleController.makeUpdateRoleHandler(deps.updateRoleUseCase)
  ));

  // Delete Role -> [Auth + P.ROLES.DELETE]
  router.register("DELETE", "/roles/:id", stack(
    [auth, requirePermission(P.ROLES.DELETE)],
    RoleController.makeDeleteRoleHandler(deps.deleteRoleUseCase)
  ));

  // --- PERMISSION ROUTES ---

  // List Permissions -> [Auth + P.PERMISSIONS.READ]
  router.register("GET", "/permissions", stack(
    [auth, requirePermission(P.PERMISSIONS.READ)],
    PermissionController.makeListPermissionsHandler(deps.listPermissionsUseCase)
  ));
};