import { Context } from "hono";
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

export class AuthController {
  constructor(
    private readonly loginUseCase: LoginUseCase,
    private readonly refreshUseCase: RefreshTokenUseCase,
    private readonly forgotUseCase: ForgotPasswordUseCase,
    private readonly resetUseCase: ResetPasswordUseCase,
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly listUsersUseCase: ListUsersUseCase,
    private readonly changeRoleUseCase: ChangeUserRoleUseCase,
    private readonly updateStatusUseCase: UpdateUserStatusUseCase,
    private readonly updateUserUseCase: UpdateUserUseCase,
    private readonly getProfileUseCase: GetUserProfileUseCase
  ) {}

  async login(c: Context) {
    try {
      const body = await c.req.json();
      const result = await this.loginUseCase.execute(body);
      return c.json(result, 200);
    } catch (error: any) {
      const status = error.message === "Credenciais inválidas." ? 401 : 400;
      return c.json({ 
        error: "Login Failed", 
        message: error.message || "Erro interno no servidor" 
      }, status);
    }
  }

  async refresh(c: Context) {
    try {
      const body = await c.req.json();
      if (!body.refreshToken) return c.json({ message: "Token não fornecido" }, 400);
      const result = await this.refreshUseCase.execute(body);
      return c.json(result);
    } catch (error: any) {
      return c.json({ message: error.message || "Erro na renovação" }, 401);
    }
  }

  async forgotPassword(c: Context) {
    try {
      const body = await c.req.json();
      const result = await this.forgotUseCase.execute(body);
      return c.json(result, 200);
    } catch (error: any) {
      return c.json({ message: error.message || "Erro ao processar solicitação" }, 400);
    }
  }

  async resetPassword(c: Context) {
    try {
      const body = await c.req.json();
      const result = await this.resetUseCase.execute(body);
      return c.json(result, 200);
    } catch (error: any) {
      return c.json({ message: error.message || "Erro ao redefinir senha" }, 400);
    }
  }

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
