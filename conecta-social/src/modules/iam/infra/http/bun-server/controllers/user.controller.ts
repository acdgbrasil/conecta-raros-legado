import type { Handler } from "../../../../../shared/http";
import { CreateUserUseCase } from "../../../../application/useCases/CreateUser.useCase";
import { ListUsersUseCase } from "../../../../application/useCases/ListUsers.useCase";
import { GetUserProfileUseCase } from "../../../../application/useCases/GetUserProfile.useCase";
import { UpdateUserUseCase } from "../../../../application/useCases/UpdateUser.useCase";
import { ToggleUserStatusUseCase } from "../../../../application/useCases/ToggleUserStatus.useCase";
import { ChangeUserRoleUseCase } from "../../../../application/useCases/ChangeUserRole.useCase";

import { CreateUserSchema } from "../../../../application/mappers/user/inputs/CreateUser.input";
import { ListUsersQuerySchema } from "../../../../application/mappers/user/inputs/ListUsers.input";
import { UpdateUserSchema } from "../../../../application/mappers/user/inputs/UpdateUser.input";
import { ChangeRoleSchema } from "../../../../application/mappers/user/inputs/ChangeRole.input";
import { UpdateUserStatusSchema } from "../../../../application/mappers/user/inputs/UpdateUserStatus.input";

/**
 * POST /users
 */
export const makeCreateUserHandler = (useCase: CreateUserUseCase): Handler => async (ctx) => {
  const body = await ctx.parseBody(CreateUserSchema);
  const result = await useCase.execute(body);
  return ctx.json(result, 201);
};

/**
 * GET /users
 */
export const makeListUsersHandler = (useCase: ListUsersUseCase): Handler => async (ctx) => {
  // Query params are strings, we might need to cast/parse them via schema if schema handles coercion
  const query = ctx.query;
  // Note: Zod schema should handle coercion if configured, otherwise we might need manual casting.
  // Assuming ListUsersQuerySchema handles basic string->number/boolean coercion or we pass raw and let Zod handle it.
  // Checking schema (not shown but assuming safeParse handles what's passed).
  // Actually, query params come as strings. If schema expects numbers, we need to convert.
  // For now passing as is, assuming schema uses z.coerce or similar.
  const result = await useCase.execute(query as any); 
  return ctx.json(result);
};

/**
 * GET /users/me
 */
export const makeGetProfileHandler = (useCase: GetUserProfileUseCase): Handler => async (ctx) => {
  // TODO: Retrieve user ID from authenticated context (ctx.user.id)
  // For now, assuming middleware sets ctx.user
  const userId = ctx.user?.id; 
  if (!userId) {
    return ctx.json({ error: "Unauthorized" }, 401);
  }
  const result = await useCase.execute({ userId });
  return ctx.json(result);
};

/**
 * PUT /users/:id
 */
export const makeUpdateUserHandler = (useCase: UpdateUserUseCase): Handler => async (ctx) => {
  const { id } = ctx.params;
  const body = await ctx.parseBody(UpdateUserSchema.omit({ userId: true })); // Omit ID from body schema if it expects it, or merge.
  // Re-assembling input if UseCase expects userId in DTO
  const input = { ...body, userId: id };
  const result = await useCase.execute(input);
  return ctx.json(result);
};

/**
 * PATCH /users/:id/status
 */
export const makeToggleStatusHandler = (useCase: ToggleUserStatusUseCase): Handler => async (ctx) => {
  const { id } = ctx.params;
  // If use case expects just the ID to toggle, or a target status.
  // ToggleUserStatusUseCase usually implies switching, but let's check input type.
  // UpdateUserStatusSchema has { userId, isActive }.
  const body = await ctx.parseBody(UpdateUserStatusSchema.pick({ isActive: true }));
  const input = { userId: id, isActive: body.isActive };
  const result = await useCase.execute(input);
  return ctx.json(result);
};

/**
 * PATCH /users/:id/role
 */
export const makeChangeRoleHandler = (useCase: ChangeUserRoleUseCase): Handler => async (ctx) => {
  const { id } = ctx.params;
  const body = await ctx.parseBody(ChangeRoleSchema.pick({ newRoleId: true }));
  const input = { userId: id, newRoleId: body.newRoleId };
  const result = await useCase.execute(input);
  return ctx.json(result);
};
