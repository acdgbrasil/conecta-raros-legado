import { LoginUseCase } from "@modules/iam/application/useCases/Login.useCase";
import { Router } from "../../../../shared/http";

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

  // --- USER ROUTES ---
  router.register("POST", "/users", UserController.makeCreateUserHandler(deps.createUserUseCase));
  router.register("GET", "/users", UserController.makeListUsersHandler(deps.listUsersUseCase));
  router.register("GET", "/users/me", UserController.makeGetProfileHandler(deps.getUserProfileUseCase));
  router.register("PUT", "/users/:id", UserController.makeUpdateUserHandler(deps.updateUserUseCase));
  router.register("PATCH", "/users/:id/status", UserController.makeToggleStatusHandler(deps.toggleUserStatusUseCase));
  router.register("PATCH", "/users/:id/role", UserController.makeChangeRoleHandler(deps.changeUserRoleUseCase));

  // --- ROLE ROUTES ---
  router.register("POST", "/roles", RoleController.makeCreateRoleHandler(deps.createRoleUseCase));
  router.register("GET", "/roles", RoleController.makeListRolesHandler(deps.listRolesUseCase));
  router.register("PUT", "/roles/:id", RoleController.makeUpdateRoleHandler(deps.updateRoleUseCase));
  router.register("DELETE", "/roles/:id", RoleController.makeDeleteRoleHandler(deps.deleteRoleUseCase));

  // --- PERMISSION ROUTES ---
  router.register("GET", "/permissions", PermissionController.makeListPermissionsHandler(deps.listPermissionsUseCase));
};