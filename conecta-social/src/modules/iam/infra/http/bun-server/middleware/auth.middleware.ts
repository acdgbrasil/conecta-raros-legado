import type { Middleware } from "../../../../../shared/http";
import { HttpError } from "../../../../../shared/http";

export const withAuth = (jwtProvider: JwtProvider): Middleware => (next) => async (ctx) => {
  const authHeader = ctx.req.headers.get("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new HttpError(401, "Token não fornecido ou mal formatado.");
  }

  const token = authHeader.split(" ")[1];

  try {
    const payload = await jwtProvider.verify(token);

    if (payload.type === 'refresh') {
      throw new HttpError(401, "Token inválido para acesso (Refresh Token).");
    }

    // Armazena payload decodificado no contexto para uso posterior
    ctx.locals.set("user", {
      id: payload.sub,
      roleId: payload.roleId,
      permissions: payload.permissions || []
    });

  } catch (err) {
    throw new HttpError(401, "Token expirado ou inválido.");
  }

  return next(ctx);
};

export const requirePermission = (requiredSlug: string): Middleware => (next) => async (ctx) => {
  const user = ctx.locals.get("user");

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
