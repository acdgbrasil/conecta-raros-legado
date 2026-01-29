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
      let body = await c.req.json();
      const result = await this.resetUseCase.execute(body);
      return c.json(result, 200);
    } catch (error: any) {
      return c.json({ message: error.message || "Erro ao redefinir senha" }, 400);
    }
  }

  
}
