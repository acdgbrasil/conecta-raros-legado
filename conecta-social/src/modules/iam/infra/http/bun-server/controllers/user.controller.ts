import type { Handler } from "../../../../../shared/http";
import { CreateUserUseCase } from "../../../../application/useCases/CreateUser.useCase";
import { ListUsersUseCase } from "../../../../application/useCases/ListUsers.useCase";
import { ChangeUserRoleUseCase } from "../../../../application/useCases/ChangeUserRole.useCase";

// Mappers (ACL)
import { CreateUserSchema } from "../../../../application/mappers/user/inputs/CreateUser.input";
import { ListUsersQuerySchema } from "../../../../application/mappers/user/inputs/ListUsers.input";
import { ChangeRoleSchema } from "../../../../application/mappers/user/inputs/ChangeRole.input";

export const makeCreateUserHandler = (useCase: CreateUserUseCase): Handler => async (ctx) => {
  const body = await ctx.parseBody(CreateUserSchema);
  const currentUser = ctx.locals.get("user");
  
  // Injeta o ID de quem está criando (se o schema permitir createdBy, senão o UseCase deve pegar de outro lugar ou ignorar)
  // O CreateUserDTO original não tinha createdBy explícito no schema lido anteriormente, 
  // mas vamos assumir que o UseCase lida com isso ou o objeto já está pronto.
  
  const result = await useCase.execute(body);
  return ctx.json(result, 201);
};

export const makeListUsersHandler = (useCase: ListUsersUseCase): Handler => async (ctx) => {
  // Parsing de Query Params
  // O ctx.query retorna Record<string, string>. Precisamos converter para números.
  const queryRaw = {
    page: Number(ctx.query.page),
    limit: Number(ctx.query.limit),
    search: ctx.query.search
  };
  
  // Validamos com o Schema da Aplicação
  const query = ListUsersQuerySchema.parse(queryRaw);
  
  const result = await useCase.execute(query);
  return ctx.json(result);
};

export const makeChangeRoleHandler = (useCase: ChangeUserRoleUseCase): Handler => async (ctx) => {
  const userId = ctx.params.id; 
  
  // O Body só deve ter newRoleId, mas o Schema da App pede userId também.
  // Vamos validar o body parcialmente usando o Schema da App omitindo o ID, 
  // ou extrair o schema do newRoleId.
  const bodyPartial = await ctx.parseBody(ChangeRoleSchema.pick({ newRoleId: true }));
  
  // Compomos o DTO final
  const input = {
    userId,
    newRoleId: bodyPartial.newRoleId
  };
  
  // Validamos o DTO completo (Final Check)
  const dto = ChangeRoleSchema.parse(input);
  
  const result = await useCase.execute(dto);
  
  return ctx.json(result);
};