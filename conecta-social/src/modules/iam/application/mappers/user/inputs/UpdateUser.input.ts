import { z } from "zod";

export const UpdateUserSchema = z.object({
  id: z.uuidv7().meta({ 
    id: "update_user_id",
    description: "ID do usuário a ser atualizado" 
  }),
  name: z.string().min(2).max(100).optional().meta({ description: "Novo nome" }),
  email: z.email().optional().meta({ description: "Novo e-mail" }),
  jobTitle: z.string().max(100).optional().meta({ description: "Novo cargo" }),
  department: z.string().max(100).optional().meta({ description: "Novo departamento" })
}).meta({ title: "Update User Input" });

export type UpdateUserDTO = z.input<typeof UpdateUserSchema>;
