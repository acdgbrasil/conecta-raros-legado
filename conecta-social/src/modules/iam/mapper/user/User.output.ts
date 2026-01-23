import { z } from "zod";
import "hono-zod-openapi";

export const UserResponseSchema = z.object({
  id: z.uuidv7()
    .meta({ description: "ID único do usuário (UUID v7)", example: "018e9c32-1b0e-7447-8a62-7231d1b12345" }),
  personId: z.uuidv7().optional()
    .meta({ description: "Golden Record ID (Integração Cross-Context)", example: "018e9c32-1b0e-7447-8a62-7231d1b12345" }),
  name: z.string()
    .meta({ description: "Nome completo do usuário", example: "Maria Souza" }),
  email: z.email()
    .meta({ description: "Endereço de e-mail institucional", example: "maria.souza@empresa.com" }),
  roleId: z.uuidv7()
    .meta({ description: "ID do cargo atribuído", example: "018e9c32-1b0e-7447-8a62-7231d1b12345" }),
  permissions: z.array(z.string())
    .meta({ description: "Lista de permissões efetivas do usuário", example: ["users:read", "reports:read"] }),
  
  isActive: z.boolean()
    .meta({ description: "Indica se o usuário pode acessar o sistema" }),
  requiresReset: z.boolean()
    .meta({ description: "Indica se o usuário deve trocar a senha no próximo login" }),
  
  jobTitle: z.string().nullable().optional()
    .meta({ description: "Cargo ou função", example: "Assistente Social" }),
  department: z.string().nullable().optional()
    .meta({ description: "Departamento", example: "Recursos Humanos" }),
  lastLoginAt: z.date().nullable().optional()
    .meta({ description: "Data do último login" }),
  
  createdAt: z.date().optional()
    .meta({ description: "Data de cadastro" }),
  updatedAt: z.date().optional()
    .meta({ description: "Data da última alteração" }),
});

export type UserResponse = z.infer<typeof UserResponseSchema>;

export const ListUsersOutputSchema = z.object({
  data: z.array(UserResponseSchema)
    .meta({ description: "Lista paginada de usuários" }),
  meta: z.object({
    page: z.number().int()
      .meta({ description: "Número da página atual", example: 1 }),
    limit: z.number().int()
      .meta({ description: "Quantidade de itens por página", example: 10 }),
    total: z.number().int()
      .meta({ description: "Total de registros encontrados", example: 50 }),
  }).meta({ description: "Metadados de paginação" }),
});

export type ListUsersOutput = z.infer<typeof ListUsersOutputSchema>;