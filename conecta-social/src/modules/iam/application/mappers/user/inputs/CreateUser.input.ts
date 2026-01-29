import { z } from "zod";

export const CreateUserSchema = z.object({
  id: z.uuidv7().optional()
    .meta({ description: "ID único opcional (UUID v7)" }),
  personId: z.uuidv7()
    .meta({ description: "ID da pessoa física (Golden Record)", example: "018e9c32-1b0e-7447-8a62-7231d1b12345" }),
  name: z.string().min(2).max(100)
    .meta({ description: "Nome completo", example: "Gabriel Silva" }),
  email: z.email()
    .meta({ description: "E-mail corporativo", example: "gabriel@empresa.com" }),
  password: z.string().min(8).optional()
    .meta({ description: "Senha em texto plano (opcional, gera uma forte se vazia)" }),
  roleId: z.uuidv7()
    .meta({ description: "ID do Cargo inicial", example: "018e9c32-1b0e-7447-8a62-7231d1b12345" }),
  isActive: z.boolean().default(true)
    .meta({ description: "Indica se o usuário está ativo" }),
  forceChangePassword: z.boolean().default(true)
    .meta({ description: "Obrigar troca de senha" })
});

export type CreateUserDTO = z.input<typeof CreateUserSchema>;