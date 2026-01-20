import z from "zod";

// 1) Entrada vinda de JSON (datas como string ISO)
const UserInputSchema = z.object({
  id: z.uuid().optional(),
  name: z.string().min(3, { error: "Nome deve ter no mínimo 3 caracteres" }),
  email: z.email({ error: "Formato de e-mail inválido" }),
  passwordHash: z.string().optional(),
  roleId: z.uuid({ error: "ID do cargo inválido" }),
  permissions: z.array(z.string()).default([]),

  cpf: z.string().optional(),
  jobTitle: z.string().optional(),
  department: z.string().optional(),

  forceChangePassword: z.boolean().default(true),
  isActive: z.boolean().default(true),

  createdBy: z.uuid().optional(),
  lastLoginAt: z.iso.datetime().optional(),
  createdAt: z.iso.datetime().optional(),
  updatedAt: z.iso.datetime().optional(),
});

export type UserInput = z.infer<typeof UserInputSchema>;

function parseUserInput(input: any): UserInput {
  return UserInputSchema.parse(input);
}

export const UserInput = {
  schema: UserInputSchema,
  parser: parseUserInput,
};