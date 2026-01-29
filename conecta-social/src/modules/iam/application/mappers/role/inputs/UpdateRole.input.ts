import { z } from "zod";

export const UpdateRoleSchema = z.object({
  id: z.uuidv7().meta({ description: "ID do cargo a ser atualizado" }),
  name: z.string().min(3).max(50).optional(),
  description: z.string().max(255).optional(),
  permissionIds: z.array(z.uuidv7()).optional()
}).meta({ 
  id: "update_role_request",
  title: "Update Role Input" 
});

export type UpdateRoleDTO = z.input<typeof UpdateRoleSchema>;
