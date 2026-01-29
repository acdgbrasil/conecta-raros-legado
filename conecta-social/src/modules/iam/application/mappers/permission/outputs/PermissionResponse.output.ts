import { z } from "zod";

export const PermissionResponseSchema = z.object({
  id: z.uuidv7()
    .meta({ description: "ID único da permissão" }),
  slug: z.string()
    .meta({ description: "Slug identificador", example: "users:create" }),
  description: z.string()
    .meta({ description: "Descrição da permissão" }),
  module: z.string()
    .meta({ description: "Módulo associado" })
}).meta({ 
  id: "permission_response",
  title: "Permission Response",
  description: "Dados da permissão retornados pela API"
});

export type PermissionResponseDTO = z.infer<typeof PermissionResponseSchema>;