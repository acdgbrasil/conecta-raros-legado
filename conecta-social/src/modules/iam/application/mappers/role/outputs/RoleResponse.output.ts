import { z } from "zod";

export const RoleResponseSchema = z.object({
  id: z.uuidv7(),
  name: z.string()
    .meta({ example: "Administrador" }),
  description: z.string(),
  isSystem: z.boolean(),
  permissionIds: z.array(z.uuidv7()),
  createdAt: z.string()
}).meta({ 
  id: "role_response",
  title: "Role Response" 
});

export type RoleResponseDTO = z.infer<typeof RoleResponseSchema>;