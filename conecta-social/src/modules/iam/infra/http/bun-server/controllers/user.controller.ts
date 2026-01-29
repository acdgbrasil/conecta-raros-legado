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
  const rawQuery = ctx.query;
  
  // Preparação para o Schema (converte strings para números onde necessário)
  const input = {
    page: rawQuery.page ? Number(rawQuery.page) : undefined,
    limit: rawQuery.limit ? Number(rawQuery.limit) : undefined,
    search: rawQuery.search
  };

  // O parse vai preencher os defaults se undefined e validar
  const validated = ListUsersQuerySchema.parse(input);
  
  const result = await useCase.execute(validated); 
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
  const body = await ctx.parseBody(UpdateUserSchema.omit({id: true})); // Omit ID from body schema if it expects it, or merge.
  // Re-assembling input if UseCase expects userId in DTO
  const input = { ...body, userId: id };
  const result = await useCase.execute({...input});
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
