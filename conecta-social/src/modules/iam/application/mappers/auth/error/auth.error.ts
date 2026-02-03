import { HTTP_STATUS } from "@modules/shared/types/http/http.status";

export type AuthZodError = {
  origin: string;
  code: string;
  minimun: number;
  inclusive: boolean;
  path: string[];
  message: string;
}

export type AuthError = {
  error: Array<AuthZodError>;
};

export type AuthErrorPayload = {
  code: string;
  message: string;
  details?: Record<string, unknown>;
};

export type AuthErrorResponse = {
  error: AuthErrorPayload;
};

// Security-oriented errors (HTTP-agnostic). Controllers can map these to status codes.
export type AuthSecurityErrorCode =
  | "INVALID_CREDENTIALS"
  | "ACCOUNT_INACTIVE"
  | "ACCOUNT_LOCKED"
  | "ACCOUNT_DISABLED"
  | "ACCOUNT_NOT_VERIFIED"
  | "MFA_REQUIRED"
  | "MFA_INVALID"
  | "MFA_EXPIRED"
  | "PASSWORD_EXPIRED"
  | "PASSWORD_REUSE_NOT_ALLOWED"
  | "TOKEN_MISSING"
  | "TOKEN_INVALID"
  | "TOKEN_EXPIRED"
  | "TOKEN_REVOKED"
  | "SESSION_NOT_FOUND"
  | "SESSION_EXPIRED"
  | "SESSION_REVOKED"
  | "FORBIDDEN"
  | "RATE_LIMITED"
  | "REQUEST_NOT_ALLOWED"
  | "SECURITY_POLICY_VIOLATION";

export type AuthSecurityErrorPayload = AuthErrorPayload & {
  code: AuthSecurityErrorCode;
};

export type AuthSecurityErrorResponse = {
  error: AuthSecurityErrorPayload;
};

export const authErrorMapper = (error: Error): AuthErrorResponse => {
  const parsed = JSON.parse(error.message) as AuthError;
  return {
    error: {
      code: "VALIDATION_ERROR",
      message: "Invalid request payload.",
      details: { issues: parsed.error }
    }
  };
};

type HttpStatusShape = { code: number; message: string };

const AUTH_ERROR_HTTP_STATUS: Record<AuthSecurityErrorCode, HttpStatusShape> = {
  INVALID_CREDENTIALS: HTTP_STATUS["4XX"].UNAUTHORIZED,
  ACCOUNT_INACTIVE: HTTP_STATUS["4XX"].FORBIDDEN,
  ACCOUNT_LOCKED: HTTP_STATUS["4XX"].FORBIDDEN,
  ACCOUNT_DISABLED: HTTP_STATUS["4XX"].FORBIDDEN,
  ACCOUNT_NOT_VERIFIED: HTTP_STATUS["4XX"].FORBIDDEN,
  MFA_REQUIRED: HTTP_STATUS["4XX"].UNAUTHORIZED,
  MFA_INVALID: HTTP_STATUS["4XX"].UNAUTHORIZED,
  MFA_EXPIRED: HTTP_STATUS["4XX"].UNAUTHORIZED,
  PASSWORD_EXPIRED: HTTP_STATUS["4XX"].FORBIDDEN,
  PASSWORD_REUSE_NOT_ALLOWED: HTTP_STATUS["4XX"].UNPROCESSABLE_CONTENT,
  TOKEN_MISSING: HTTP_STATUS["4XX"].UNAUTHORIZED,
  TOKEN_INVALID: HTTP_STATUS["4XX"].UNAUTHORIZED,
  TOKEN_EXPIRED: HTTP_STATUS["4XX"].UNAUTHORIZED,
  TOKEN_REVOKED: HTTP_STATUS["4XX"].UNAUTHORIZED,
  SESSION_NOT_FOUND: HTTP_STATUS["4XX"].UNAUTHORIZED,
  SESSION_EXPIRED: HTTP_STATUS["4XX"].UNAUTHORIZED,
  SESSION_REVOKED: HTTP_STATUS["4XX"].UNAUTHORIZED,
  FORBIDDEN: HTTP_STATUS["4XX"].FORBIDDEN,
  RATE_LIMITED: HTTP_STATUS["4XX"].TOO_MANY_REQUESTS,
  REQUEST_NOT_ALLOWED: HTTP_STATUS["4XX"].METHOD_NOT_ALLOWED,
  SECURITY_POLICY_VIOLATION: HTTP_STATUS["4XX"].FORBIDDEN
};

export const authSecurityErrorToResponseInit = (
  error: AuthSecurityErrorPayload,
  headers: HeadersInit = { "Content-Type": "application/json" }
): ResponseInit => {
  const status = AUTH_ERROR_HTTP_STATUS[error.code] ?? HTTP_STATUS["5XX"].INTERNAL_SERVER_ERROR;
  return {
    status: status.code,
    statusText: status.message,
    headers
  };
};

type AuthHttpErrorResult = {
  body: AuthSecurityErrorResponse | AuthErrorResponse;
  init: ResponseInit;
};

export const authHttpErrorMapper = (error: unknown): AuthHttpErrorResult => {
  if (error instanceof SyntaxError) {
    return {
      body: { error: { code: "BAD_REQUEST", message: "Invalid JSON payload." } },
      init: {
        status: HTTP_STATUS["4XX"].BAD_REQUEST.code,
        statusText: HTTP_STATUS["4XX"].BAD_REQUEST.message,
        headers: { "Content-Type": "application/json" }
      }
    };
  }

  if (error instanceof Error) {
    if (error.message.includes("Invalid credentials")) {
      const authError: AuthSecurityErrorPayload = {
        code: "INVALID_CREDENTIALS",
        message: "Invalid credentials."
      };
      return {
        body: { error: authError },
        init: authSecurityErrorToResponseInit(authError)
      };
    }

    if (error.message.includes("inactive account")) {
      const authError: AuthSecurityErrorPayload = {
        code: "ACCOUNT_INACTIVE",
        message: "Inactive account."
      };
      return {
        body: { error: authError },
        init: authSecurityErrorToResponseInit(authError)
      };
    }

    try {
      return {
        body: authErrorMapper(error),
        init: {
          status: HTTP_STATUS["4XX"].BAD_REQUEST.code,
          statusText: HTTP_STATUS["4XX"].BAD_REQUEST.message,
          headers: { "Content-Type": "application/json" }
        }
      };
    } catch {
      return {
        body: { error: { code: "INTERNAL_SERVER_ERROR", message: "Unknown error." } },
        init: {
          status: HTTP_STATUS["5XX"].INTERNAL_SERVER_ERROR.code,
          statusText: HTTP_STATUS["5XX"].INTERNAL_SERVER_ERROR.message,
          headers: { "Content-Type": "application/json" }
        }
      };
    }
  }

  return {
    body: { error: { code: "INTERNAL_SERVER_ERROR", message: "Unknown error." } },
    init: {
      status: HTTP_STATUS["5XX"].INTERNAL_SERVER_ERROR.code,
      statusText: HTTP_STATUS["5XX"].INTERNAL_SERVER_ERROR.message,
      headers: { "Content-Type": "application/json" }
    }
  };
};
