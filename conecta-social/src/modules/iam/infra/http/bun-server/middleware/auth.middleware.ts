import { JwtProvider } from "@modules/shared/domain/services/JwtProvider.protocol";
import type { Middleware } from "../../../../../shared/http";
import { HttpError } from "../../../../../shared/http";
import { AuthMapper } from "@modules/iam/application/mappers/auth/Auth.mapper";

export const withAuth = (jwtProvider: JwtProvider): Middleware => (next) => async (ctx) => {
  const authHeader = ctx.req.headers.get("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new HttpError(401, "Token não fornecido ou mal formatado.");
  }

  const token = authHeader.split(" ")[1];

  try {
    const rawPayload = await jwtProvider.verify(token);

    const payload = AuthMapper.validateTokenPayload(rawPayload);

    if (payload.type === 'refresh') throw new HttpError(401, "Token inválido para acesso (Refresh Token).");

    // 3. Hidrata o contexto
    const user = {
      id: payload.sub,
      roleId: payload.roleId,
      permissions: payload.permissions || []
    };
    
    // Compatibilidade dupla (Locals + Propriedade direta)
    ctx.locals.set("user", user);
    ctx.user = user;

  } catch (err) {
    if (err instanceof HttpError) throw err; // Re-throw erros controlados
    throw new HttpError(401, "Token expirado ou inválido.");
  }

  return next(ctx);
};

export const requirePermission = (requiredSlug: string): Middleware => (next) => async (ctx) => {
  const user = ctx.user || ctx.locals.get("user");

  if (!user) {
    throw new HttpError(401, "Usuário não autenticado (Internal Error: Auth Middleware missing?).");
  }

  // Verifica se a permissão existe no array de permissões do token (Claim-based auth)
  // Nota: Para sistemas complexos, talvez precisemos recarregar do banco, mas por performance confiamos no token aqui.
  if (!user.permissions.includes(requiredSlug) && !user.permissions.includes("*")) {
     throw new HttpError(403, `Acesso negado. Requer: [${requiredSlug}]`);
  }

  return next(ctx);
};
