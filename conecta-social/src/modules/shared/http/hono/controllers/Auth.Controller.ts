import { Context } from "hono";
import { LoginUseCase } from "../../../../iam/application/UseCase/Login.useCase";

export class AuthController {
  constructor(private readonly loginUseCase: LoginUseCase) {}
  async login(c: Context) {
    try {
      const body = await c.req.json();
      const result = await this.loginUseCase.execute(body);
      return c.json(result, 200);
    }catch (error: Error | any) {
      const status = error.message === "Credenciais inválidas." ? 401 : 400;
      
      return c.json({ 
        error: "Login Failed", 
        message: error.message || "Erro interno no servidor" 
      }, status);
    }
  }
}