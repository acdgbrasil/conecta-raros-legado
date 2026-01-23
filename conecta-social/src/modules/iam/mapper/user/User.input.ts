import { z } from "zod";
import "hono-zod-openapi";

export const CreateUserInputSchema = z.object({
  name: z.string()
    .min(3, { error: "Nome deve ter no mínimo 3 caracteres" })
    .meta({
      description: "Nome completo do usuário",
      example: "João da Silva"
    }),
  email: z.email({ error: "Formato de e-mail inválido" })
    .meta({
      description: "Endereço de e-mail corporativo",
      example: "joao.silva@empresa.com"
    }),
  password: z.string().optional()
    .meta({
      description: "Senha inicial do usuário (opcional se gerada automaticamente)",
      example: "S3nhaForte!123"
    }), 
  roleId: z.uuidv7({ error: "ID do cargo inválido" })
    .meta({
      description: "ID de referência para o cargo/permissão do usuário (UUID v7)",
      example: "018e9c32-1b0e-7447-8a62-7231d1b12345"
    }),
  
  // Metadados Opcionais
  jobTitle: z.string().optional()
    .meta({
      description: "Cargo ou função do usuário na empresa",
      example: "Analista de Sistemas"
    }),
  department: z.string().optional()
    .meta({
      description: "Departamento ou setor do usuário",
      example: "Tecnologia da Informação"
    }),
  createdBy: z.uuidv7().optional()
    .meta({
      description: "ID do usuário que criou este registro (UUID v7)",
      example: "018e9c32-1b0e-7447-8a62-7231d1b12345"
    }),
  isActive: z.boolean().default(true)
    .meta({
      description: "Define se o usuário está ativo no sistema",
      example: true
    }),
  forceChangePassword: z.boolean().default(true)
    .meta({
      description: "Obriga o usuário a alterar a senha no próximo login",
      example: true
    }),
});

export type CreateUserInput = z.infer<typeof CreateUserInputSchema>;

export const UpdateUserInputSchema = CreateUserInputSchema.partial().extend({
  id: z.uuidv7({ error: "ID é obrigatório para atualização" })
    .meta({
      description: "ID único do usuário a ser atualizado (UUID v7)",
      example: "018e9c32-1b0e-7447-8a62-7231d1b12345"
    }),
});

export type UpdateUserInput = z.infer<typeof UpdateUserInputSchema>;

// --- LIST USERS INPUT ---
export const ListUsersInputSchema = z.object({
  page: z.coerce.number().int().min(1).default(1)
    .meta({
      description: "Número da página para paginação",
      example: 1
    }),
  limit: z.coerce.number().int().min(1).max(100).default(10)
    .meta({
      description: "Quantidade de itens por página",
      example: 20
    }),
});

export type ListUsersInput = z.infer<typeof ListUsersInputSchema>;

// --- CHANGE ROLE INPUT ---
export const ChangeRoleInputSchema = z.object({
  userId: z.uuidv7()
    .meta({
      description: "ID do usuário para alteração de cargo",
      example: "018e9c32-1b0e-7447-8a62-7231d1b12345"
    }),
  newRoleId: z.uuidv7({ error: "ID do cargo inválido" })
    .meta({
      description: "Novo ID do cargo a ser atribuído (UUID v7)",
      example: "018e9c32-1b0e-7447-8a62-7231d1b12345"
    }),
});

export type ChangeRoleInput = z.infer<typeof ChangeRoleInputSchema>;

// --- UPDATE STATUS INPUT ---
export const UpdateUserStatusInputSchema = z.object({
  userId: z.uuidv7()
    .meta({
      description: "ID do usuário para alteração de status",
      example: "018e9c32-1b0e-7447-8a62-7231d1b12345"
    }),
  isActive: z.boolean({ error: "O status deve ser um booleano (true/false)" })
    .meta({
      description: "Novo status do usuário (true=ativo, false=inativo)",
      example: false
    }),
});

export type UpdateUserStatusInput = z.infer<typeof UpdateUserStatusInputSchema>;

export const UserInput = {
  create: CreateUserInputSchema,
  update: UpdateUserInputSchema,
  list: ListUsersInputSchema,
  changeRole: ChangeRoleInputSchema,
  updateStatus: UpdateUserStatusInputSchema,
  
  parserCreate: (input: unknown) => CreateUserInputSchema.parse(input),
  parserUpdate: (input: unknown) => UpdateUserInputSchema.parse(input),
  parserList: (input: unknown) => ListUsersInputSchema.parse(input),
  parserChangeRole: (input: unknown) => ChangeRoleInputSchema.parse(input),
  parserUpdateStatus: (input: unknown) => UpdateUserStatusInputSchema.parse(input),
};