import type { Handler } from "../../../../../shared/http";
import { ListPermissionsUseCase } from "../../../../application/useCases/ListPermissions.useCase";

/**
 * GET /permissions
 */
export const makeListPermissionsHandler = (useCase: ListPermissionsUseCase): Handler => async (ctx) => {
  const result = await useCase.execute();
  return ctx.json(result);
};
