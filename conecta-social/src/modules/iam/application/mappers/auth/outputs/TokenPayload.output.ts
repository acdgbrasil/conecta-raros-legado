import { z } from "zod";

/**
 * TokenPayloadSchema - O contrato do que vive dentro do JWT (Claims).
 * Especialista Zod: Atualizado para usar z.uuidv7() nativo do Zod 4.
 */
export const TokenPayloadSchema = z.object({
  sub: z.uuidv7().meta({ 
    id: "token_sub",
    description: "ID do Usuário (Subject)" 
  }),
  roleId: z.uuidv7().meta({ 
    id: "token_role",
    description: "ID do Cargo vinculado" 
  }),
  type: z.enum(["access", "refresh"]).meta({ 
    description: "Tipo do Token (Rotação de Segurança)" 
  }),
  
  // Lista de slugs de permissão (ex: "users:create")
  permissions: z.array(
    z.string().regex(/^[a-z0-9_]+:[a-z0-9_]+$/)
  ).optional().default([]).meta({
    description: "Claims de permissões para Check ACL rápido"
  }),

  // JWT Standard Claims
  iat: z.number().optional().meta({ description: "Issued At (Timestamp)" }),
  exp: z.number().optional().meta({ description: "Expires At (Timestamp)" })
}).meta({ 
  title: "Token Payload Schema",
  description: "Estrutura interna dos tokens JWT do sistema"
});

export type TokenPayloadDTO = z.infer<typeof TokenPayloadSchema>;
