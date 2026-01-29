import { Context } from "hono";
import { ChangeUserRoleUseCase } from "modules/iam/application/useCases/ChangeUserRole.useCase";
import { CreateUserUseCase } from "modules/iam/application/useCases/CreateUser.useCase";
import { GetUserProfileUseCase } from "modules/iam/application/useCases/GetUserProfile.useCase";
import { ListUsersUseCase } from "modules/iam/application/useCases/ListUsers.useCase";
import { UpdateUserUseCase } from "modules/iam/application/useCases/UpdateUser.useCase";
import { UpdateUserStatusUseCase } from "modules/iam/application/useCases/UpdateUserStatus.useCase";

export class UserController {
  constructor(
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly listUsersUseCase: ListUsersUseCase,
    private readonly changeRoleUseCase: ChangeUserRoleUseCase,
    private readonly updateStatusUseCase: UpdateUserStatusUseCase,
    private readonly updateUserUseCase: UpdateUserUseCase,
    private readonly getProfileUseCase: GetUserProfileUseCase) { }

  async createUser(c: Context) {
    try {
      const body = await c.req.json();
      const currentUser = c.get('user');
      const input = { ...body, createdBy: currentUser.id };

      const result = await this.createUserUseCase.execute(input);
      return c.json(result, 201);
    } catch (error: any) {
      return c.json({ message: error.message || "Erro ao criar usuário", details: error.issues }, 400);
    }
  }

  async listUsers(c: Context) {
    try {
      const page = Number(c.req.query('page')) || 1;
      const limit = Number(c.req.query('limit')) || 10;

      const result = await this.listUsersUseCase.execute({ page, limit });
      return c.json(result, 200);
    } catch (error: any) {
      return c.json({ message: error.message || "Erro ao listar usuários" }, 500);
    }
  }

  async changeUserRole(c: Context) {
    try {
      const userId = c.req.param('id');
      const { newRoleId } = await c.req.json();

      const result = await this.changeRoleUseCase.execute({ userId, newRoleId });
      return c.json(result, 200);
    } catch (error: any) {
      return c.json({ message: error.message || "Erro ao alterar cargo" }, 400);
    }
  }

  async updateUserStatus(c: Context) {
    try {
      const userId = c.req.param('id');
      const { isActive } = await c.req.json();

      const result = await this.updateStatusUseCase.execute({ userId, isActive });
      return c.json(result, 200);
    } catch (error: any) {
      return c.json({ message: error.message || "Erro ao alterar status" }, 400);
    }
  }

  async updateUser(c: Context) {
    try {
      const userId = c.req.param('id');
      const body = await c.req.json();
      const input = { ...body, id: userId };

      const result = await this.updateUserUseCase.execute(input);
      return c.json(result, 200);
    } catch (error: any) {
      return c.json({ message: error.message || "Erro ao atualizar usuário", details: error.issues }, 400);
    }
  }

  async getProfile(c: Context) {
    try {
      const currentUser = c.get('user');
      const result = await this.getProfileUseCase.execute({ userId: currentUser.id! });
      return c.json(result, 200);
    } catch (error: any) {
      return c.json({ message: error.message || "Erro ao buscar perfil" }, 404);
    }
  }


}



