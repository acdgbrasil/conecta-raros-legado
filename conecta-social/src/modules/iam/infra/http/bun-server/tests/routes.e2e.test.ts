import { describe, expect, test, mock } from "bun:test";
import { Router } from "@modules/shared/http";
import { registerIamRoutes } from "../routes";
import { JwtProvider } from "@modules/shared/domain/services/JwtProvider.protocol";
import { TokenPayloadDTO } from "@modules/iam/application/mappers/auth/outputs/TokenPayload.output";

// Mock UseCases (Retornam sucesso simples)
const mockDeps = {
  loginUseCase: { execute: mock(async () => ({ accessToken: "t", refreshToken: "r", user: {} })) } as any,
  refreshTokenUseCase: { execute: mock(async () => ({})) } as any,
  forgotPasswordUseCase: { execute: mock(async () => ({})) } as any,
  resetPasswordUseCase: { execute: mock(async () => ({})) } as any,
  
  createUserUseCase: { execute: mock(async () => ({})) } as any,
  listUsersUseCase: { execute: mock(async () => ({ data: [], meta: {} })) } as any,
  getUserProfileUseCase: { execute: mock(async () => ({})) } as any,
  updateUserUseCase: { execute: mock(async () => ({})) } as any,
  toggleUserStatusUseCase: { execute: mock(async () => ({})) } as any,
  changeUserRoleUseCase: { execute: mock(async () => ({})) } as any,

  createRoleUseCase: { execute: mock(async () => ({})) } as any,
  listRolesUseCase: { execute: mock(async () => []) } as any,
  updateRoleUseCase: { execute: mock(async () => ({})) } as any,
  deleteRoleUseCase: { execute: mock(async () => {}) } as any,

  listPermissionsUseCase: { execute: mock(async () => []) } as any,

  // Mock JWT Provider
  jwtProvider: {
    sign: mock(),
    verify: mock()
  } as unknown as JwtProvider
};

describe("IAM Routes E2E (Middleware & ACL)", () => {
  const router = new Router();
  registerIamRoutes(router, mockDeps);

  const VALID_UUID_1 = "018e9c32-1b0e-7447-8a62-7231d1b12345";
  const VALID_UUID_2 = "018e9c32-1b0e-7447-8a62-7231d1b12346";

  const createRequest = (method: string, path: string, token?: string) => {
    const headers = new Headers();
    if (token) headers.set("Authorization", `Bearer ${token}`);
    return new Request(`http://localhost${path}`, { method, headers });
  };

  test("Public Route: POST /auth/login should be accessible without token", async () => {
    const match = router.match("POST", "/auth/login");
    expect(match).toBeDefined();
  });

  test("Protected Route: GET /users should block request without token (401)", async () => {
    const match = router.match("GET", "/users");
    if (!match) throw new Error("Route not found");

    const ctx = { 
      req: createRequest("GET", "/users"), 
      json: mock(),
      query: {} 
    } as any;

    try {
      await match.handler(ctx);
      expect(true).toBe(false); 
    } catch (err: any) {
      expect(err.status).toBe(401);
      expect(err.message).toContain("Token não fornecido");
    }
  });

  test("ACL: GET /users should block request with token but missing permission (403)", async () => {
    const match = router.match("GET", "/users");
    if (!match) throw new Error("Route not found");

    // Mock verify para retornar usuário SEM permissão, mas com UUIDs válidos para o Zod
    (mockDeps.jwtProvider.verify as any).mockResolvedValue({
      sub: VALID_UUID_1,
      roleId: VALID_UUID_2,
      type: "access",
      permissions: ["other:perm"] 
    } as TokenPayloadDTO);

    const ctx = { 
      req: createRequest("GET", "/users", "valid-token"), 
      json: mock(),
      locals: new Map(),
      query: {}
    } as any;

    try {
      await match.handler(ctx);
      expect(true).toBe(false); 
    } catch (err: any) {
      expect(err.status).toBe(403);
      expect(err.message).toContain("Acesso negado");
    }
  });

  test("ACL: GET /users should allow request with token AND correct permission", async () => {
    const match = router.match("GET", "/users");
    if (!match) throw new Error("Route not found");

    // Mock verify para retornar usuário COM permissão
    (mockDeps.jwtProvider.verify as any).mockResolvedValue({
      sub: VALID_UUID_1,
      roleId: VALID_UUID_2,
      type: "access",
      permissions: ["users:read"] 
    } as TokenPayloadDTO);

    const ctx = { 
      req: createRequest("GET", "/users", "valid-token"), 
      json: mock((data) => data), 
      locals: new Map(),
      query: { page: "1", limit: "10" }
    } as any;

    await match.handler(ctx);
    
    expect(mockDeps.listUsersUseCase.execute).toHaveBeenCalled();
  });
});