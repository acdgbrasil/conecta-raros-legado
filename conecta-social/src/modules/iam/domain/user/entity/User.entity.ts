import { z } from "zod";
import "hono-zod-openapi";

export const UserSchema = z.object({
  id: z.uuid({
    version: "v7",
    error: "id deve ser um UUID v7 válido",
  }).optional()
    .meta({ 
      description: "Identificador único ordenável (UUID v7) do usuário",
      example: "018e9c32-1b0e-7447-8a62-7231d1b12345" 
    }),
  personId: z.uuid({
    version: "v7",
    error: "personId deve ser um UUID v7 válido",
  }).optional()
    .meta({ 
      description: "Identificador único (Golden Record) para integração entre Bounded Contexts",
      example: "018e9c32-1b0e-7447-8a62-7231d1b12345" 
    }),
  name: z.string().min(3, { error: "Nome deve ter no mínimo 3 caracteres" })
    .meta({ 
      description: "Nome completo do usuário",
      example: "João da Silva" 
    }),
  email: z.email({ error: "Formato de e-mail inválido" })
    .meta({ 
      description: "E-mail institucional único",
      example: "joao.silva@envolve.com.br" 
    }),
  passwordHash: z.string().optional()
    .meta({ 
      description: "Hash da senha (BCrypt) para armazenamento seguro",
      example: "$2b$10$K... (hash truncado)" 
    }),
  roleId: z.uuid({
    version: "v7",
    error: "roleId deve ser um UUID v7 válido",
  })
    .meta({ 
      description: "ID de referência para o cargo/permissão (UUID v7)",
      example: "018e9c32-1b0e-7447-8a62-7231d1b12345" 
    }),
  permissions: z.array(z.string()).default([])
    .meta({ 
      description: "Lista de slugs de permissão carregadas (ex: users:read)",
      example: ["users:read", "families:write"] 
    }),

  jobTitle: z.string().optional()
    .meta({ 
      description: "Cargo ou função técnica",
      example: "Analista Social" 
    }),
  department: z.string().optional()
    .meta({ 
      description: "Departamento ou setor de alocação",
      example: "CRAS Central" 
    }),

  forceChangePassword: z.boolean().default(true)
    .meta({ 
      description: "Flag de segurança que obriga a troca de senha no primeiro login",
      example: true 
    }),
  isActive: z.boolean().default(true)
    .meta({ 
      description: "Status de ativação da conta no sistema",
      example: true 
    }),

  createdBy: z.uuid({
    version: "v7",
  }).optional()
    .meta({ 
      description: "UUID v7 do administrador que criou o registro",
      example: "018e9c32-1b0e-7447-8a62-7231d1b12345"
    }),
  lastLoginAt: z.date().optional()
    .meta({ 
      description: "Data e hora do último acesso bem-sucedido" 
    }),
  createdAt: z.date().optional()
    .meta({ 
      description: "Timestamp de criação do registro" 
    }),
  updatedAt: z.date().optional()
    .meta({ 
      description: "Timestamp da última atualização do registro" 
    }),
});

export type UserEntity = z.infer<typeof UserSchema>;