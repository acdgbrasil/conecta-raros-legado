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
import { TokenPayloadSchema, TokenPayloadDTO } from "./outputs/TokenPayload.output";
import { HTTP_STATUS } from "@modules/shared/types/http/http.status";

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
      ResetPasswordResponse: ResetPasswordResponseSchema,
      TokenPayload: TokenPayloadSchema
    }
  };

  // Validadores de Input
  public static validateLogin(raw: {email: string, password: string}): LoginDTO { return LoginSchema.parse(raw); }
  public static validateRefresh(raw: unknown): RefreshTokenDTO { return RefreshTokenSchema.parse(raw); }
  public static validateForgotPassword(raw: unknown): ForgotPasswordDTO { return ForgotPasswordSchema.parse(raw); }
  public static validateResetPassword(raw: unknown): ResetPasswordDTO { return ResetPasswordSchema.parse(raw); }

  // Validadores de Token
  public static validateTokenPayload(raw: unknown): TokenPayloadDTO { return TokenPayloadSchema.parse(raw); }

  // Validadores de Resposta (Double Check)
  public static toLoginResponse(data: unknown): LoginResponseDTO { return LoginResponseSchema.parse(data); }
  public static toRefreshResponse(data: unknown) { return RefreshTokenResponseSchema.parse(data); }

  // HTTP ACL helpers
  public static response = {
    ok<T>(data: T, headers: HeadersInit = { "Content-Type": "application/json" }) {
      return {
        body: { data },
        init: {
          status: HTTP_STATUS["2XX"].OK.code,
          statusText: HTTP_STATUS["2XX"].OK.message,
          headers: new Headers(headers)
        } as ResponseInit
      };
    },
    okNoStore<T>(data: T, headers: HeadersInit = { "Content-Type": "application/json" }) {
      const merged = new Headers(headers);
      merged.set("Cache-Control", "no-store");
      return {
        body: { data },
        init: {
          status: HTTP_STATUS["2XX"].OK.code,
          statusText: HTTP_STATUS["2XX"].OK.message,
          headers: merged
        } as ResponseInit
      };
    }
  };
}
