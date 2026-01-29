import { z } from "zod";

export const CreateRoleSchema = z.object({
  id: z.uuidv7().optional()
    .meta({ description: "ID único opcional" }),
  name: z.string().min(3).max(50)
    .meta({ 
      id: "role_name",
      description: "Nome comercial do cargo", 
      example: "Gerente de TI" 
    }),
  description: z.string().max(255)
    .meta({ description: "Breve descrição das responsabilidades" }),
  isSystem: z.boolean().default(false)
    .meta({ description: "Indica se é um cargo imutável de sistema" }),
  permissionIds: z.array(z.uuidv7())
    .meta({ 
      description: "Lista de IDs de permissões a serem vinculadas",
      example: ["018e9c34-2e0b-70c8-8000-123456789001"]
    })
}).meta({ 
  id: "create_role_request",
  title: "Create Role Input" 
});

export type CreateRoleDTO = z.input<typeof CreateRoleSchema>;