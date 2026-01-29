import type { Handler } from "../../../../../shared/http";
import { CreateRoleUseCase } from "../../../../application/useCases/CreateRole.useCase";
import { ListRolesUseCase } from "../../../../application/useCases/ListRoles.useCase";
import { UpdateRoleUseCase } from "../../../../application/useCases/UpdateRole.useCase";
import { DeleteRoleUseCase } from "../../../../application/useCases/DeleteRole.useCase";

import { CreateRoleSchema } from "../../../../application/mappers/role/inputs/CreateRole.input";
import { UpdateRoleSchema } from "../../../../application/mappers/role/inputs/UpdateRole.input";

/**
 * POST /roles
 */
export const makeCreateRoleHandler = (useCase: CreateRoleUseCase): Handler => async (ctx) => {
  const actorId = ctx.user?.id;
  if (!actorId) return ctx.json({ error: "Unauthorized" }, 401);

  const body = await ctx.parseBody(CreateRoleSchema);
  const result = await useCase.execute({ ...body, actorId });
  return ctx.json(result, 201);
};

/**
 * GET /roles
 */
export const makeListRolesHandler = (useCase: ListRolesUseCase): Handler => async (ctx) => {
  const result = await useCase.execute();
  return ctx.json(result);
};

/**
 * PUT /roles/:id
 */
export const makeUpdateRoleHandler = (useCase: UpdateRoleUseCase): Handler => async (ctx) => {
  const actorId = ctx.user?.id;
  if (!actorId) return ctx.json({ error: "Unauthorized" }, 401);

  const { id } = ctx.params;
  const body = await ctx.parseBody(UpdateRoleSchema.omit({ id: true }));
  const input = { ...body, id, actorId };
  const result = await useCase.execute(input);
  return ctx.json(result);
};

/**
 * DELETE /roles/:id
 */
export const makeDeleteRoleHandler = (useCase: DeleteRoleUseCase): Handler => async (ctx) => {
  const { id } = ctx.params;
  await useCase.execute({ id });
  return ctx.json({ message: "Role deleted successfully" }, 200); // Or 204 No Content
};