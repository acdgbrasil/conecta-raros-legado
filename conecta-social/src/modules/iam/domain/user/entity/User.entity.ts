import { z } from "zod";

export const UserSchema = z.object({
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
  lastLoginAt: z.date().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export type UserEntity = z.infer<typeof UserSchema>;