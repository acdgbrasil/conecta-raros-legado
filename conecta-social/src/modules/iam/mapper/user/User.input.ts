import z from "zod";

export const CreateUserInputSchema = z.object({
  name: z.string().min(3, { error: "Nome deve ter no mínimo 3 caracteres" }),
  email: z.email({ error: "Formato de e-mail inválido" }),
  password: z.string().optional(), // Pode ser opcional se sistema gerar senha
  roleId: z.uuid({ error: "ID do cargo inválido" }),
  
  // Metadados Opcionais
  cpf: z.string().optional(),
  jobTitle: z.string().optional(),
  department: z.string().optional(),
  createdBy: z.uuid().optional(),
  isActive: z.boolean().default(true),
  forceChangePassword: z.boolean().default(true),
});

export type CreateUserInput = z.infer<typeof CreateUserInputSchema>;

export const UpdateUserInputSchema = CreateUserInputSchema.partial().extend({
  id: z.uuid({ error: "ID é obrigatório para atualização" }),
});

export type UpdateUserInput = z.infer<typeof UpdateUserInputSchema>;

// --- LIST USERS INPUT ---
export const ListUsersInputSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
});

export type ListUsersInput = z.infer<typeof ListUsersInputSchema>;

// --- CHANGE ROLE INPUT ---
export const ChangeRoleInputSchema = z.object({
  userId: z.string().uuid(),
  newRoleId: z.string().uuid({ error: "ID do cargo inválido" }),
});

export type ChangeRoleInput = z.infer<typeof ChangeRoleInputSchema>;

// --- UPDATE STATUS INPUT ---
export const UpdateUserStatusInputSchema = z.object({
  userId: z.string().uuid(),
  isActive: z.boolean({ error: "O status deve ser um booleano (true/false)" }),
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