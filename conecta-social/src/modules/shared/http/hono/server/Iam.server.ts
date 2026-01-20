import { Hono } from "hono";
import { UserPostgresRepository } from "../../../infra/postgres/services/Postgres.service";
import { HonoJwtService } from "../../../infra/hono/jwt/HonoJwt.service";
import { LoginUseCase } from "../../../../iam/application/UseCase/Login.useCase";
import { AuthController } from "../controllers/Auth.Controller";

export const IamServer = () => {
  const app = new Hono();

  const userRepository = new UserPostgresRepository();
  const jwtProvider = new HonoJwtService();

  const loginUseCase = new LoginUseCase(userRepository, jwtProvider);
  const authController = new AuthController(loginUseCase);

  app.post("/auth/login", (c) => authController.login(c));
  
  return app;
}