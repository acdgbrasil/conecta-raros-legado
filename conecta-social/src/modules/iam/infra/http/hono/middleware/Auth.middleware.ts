// ------------------------------------------------------------------
// 1. Tipagem Global (Augmentation)
// Isso ensina ao TypeScript que c.get('user') existe e retorna nossa Classe User

import { Context, MiddlewareHandler, Next } from "hono";
import { JwtProvider } from "../../../../../shared/providers/jwt/Jwt.provider"; 
import { User } from "../../../../domain/user/factories/User.factory"; 
import { UserEntity } from "../../../../domain/user/aggregate/User.entity";

// ------------------------------------------------------------------
declare module 'hono' {
  interface ContextVariableMap {
    user: User;
  }
}

// ------------------------------------------------------------------
// 2. Middleware de Autenticação
// Recebe o Provider de JWT e retorna o handler do Hono
// ------------------------------------------------------------------
export const authMiddleware = (jwtProvider: JwtProvider): MiddlewareHandler => {
  return async (c: Context, next: Next) => {
    const authHeader = c.req.header('Authorization');

    if (!authHeader) {
      return c.json({ message: 'Token não fornecido.' }, 401);
    }

    // Formato esperado: "Bearer <token>"
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return c.json({ message: 'Token mal formatado.' }, 401);
    }

    const token = parts[1];

    try {
      // Verifica assinatura e expiração
      const payload = await jwtProvider.verify(token);

      // Validação Extra: Tokens de Refresh não podem ser usados para acessar rotas
      if (payload.type === 'refresh') {
        return c.json({ message: 'Token inválido para acesso (Use o Refresh Token na rota correta).' }, 401);
      }

      // Hidratação: Reconstrói a entidade User a partir do payload
      // Mapeamos manualmente para garantir que bata com o UserEntity
      const userProps: UserEntity = {
        id: payload.sub, // 'sub' é o padrão JWT para ID
        roleId: payload.roleId,
        permissions: payload.permissions || [],
        
        // Dados que talvez venham no token (depende do seu LoginUseCase)
        name: payload.name || 'User',
        email: payload.email || '',
        
        // Defaults de segurança para objeto em memória
        isActive: true, 
        forceChangePassword: payload.forceChangePassword || false,
        
        // Campos opcionais que não trafegam no token
        createdAt: undefined,
        updatedAt: undefined,
        lastLoginAt: undefined,
        passwordHash: undefined,
        createdBy: undefined
      };

      // O restore cria a instância sem rodar validações pesadas (o token já é confiável)
      const user = User.restore(userProps);

      // Injeta no contexto
      c.set('user', user);

      await next();

    } catch (error) {
      return c.json({ message: 'Token expirado ou inválido.' }, 401);
    }
  };
};

// ------------------------------------------------------------------
// 3. Guardião de Permissões
// Verifica se o usuário injetado tem a permissão necessária
// ------------------------------------------------------------------
export const requirePermission = (requiredSlug: string): MiddlewareHandler => {
  return async (c: Context, next: Next) => {
    // Graças ao 'declare module' acima, o TS sabe que isso é um User
    const user = c.get('user');

    if (!user) {
      return c.json({ message: 'Usuário não autenticado.' }, 401);
    }

    // Usa a lógica poderosa do seu Domínio (Wildcards, etc)
    if (!user.can(requiredSlug)) {
      return c.json({ 
        message: `Acesso negado. Requer permissão: [${requiredSlug}]` 
      }, 403);
    }

    await next();
  };
};