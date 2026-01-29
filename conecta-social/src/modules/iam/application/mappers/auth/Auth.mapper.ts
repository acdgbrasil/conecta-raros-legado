import { LoginSchema, LoginDTO } from "./inputs/Login.input";
import { RefreshTokenSchema, RefreshTokenDTO } from "./inputs/RefreshToken.input";
import { ForgotPasswordSchema, ForgotPasswordDTO } from "./inputs/ForgotPassword.input";
import { ResetPasswordSchema, ResetPasswordDTO } from "./inputs/ResetPassword.input";
import { LoginResponseSchema, LoginResponseDTO } from "./outputs/LoginResponse.output";
import { 
  RefreshTokenResponseSchema, 
  ForgotPasswordResponseSchema, 
  ResetPasswordResponseSchema 
} from "./outputs/AuthResponses.output";

export class AuthMapper {
  public static readonly Schemas = {
    Input: {
      Login: LoginSchema,
      Refresh: RefreshTokenSchema,
      ForgotPassword: ForgotPasswordSchema,
      ResetPassword: ResetPasswordSchema
    },
    Output: {
      LoginResponse: LoginResponseSchema,
      RefreshResponse: RefreshTokenResponseSchema,
      ForgotPasswordResponse: ForgotPasswordResponseSchema,
      ResetPasswordResponse: ResetPasswordResponseSchema
    }
  };

  // Validadores de Input
  public static validateLogin(raw: unknown): LoginDTO { return LoginSchema.parse(raw); }
  public static validateRefresh(raw: unknown): RefreshTokenDTO { return RefreshTokenSchema.parse(raw); }
  public static validateForgotPassword(raw: unknown): ForgotPasswordDTO { return ForgotPasswordSchema.parse(raw); }
  public static validateResetPassword(raw: unknown): ResetPasswordDTO { return ResetPasswordSchema.parse(raw); }

  // Validadores de Resposta (Double Check)
  public static toLoginResponse(data: unknown): LoginResponseDTO { return LoginResponseSchema.parse(data); }
}