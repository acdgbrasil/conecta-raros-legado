import { z } from "zod";

export const CreatePermissionSchema = z.object({
  id: z.uuidv7().optional()
    .meta({ 
      id: "permission_id",
      description: "ID único da permissão (opcional na criação, gerado pelo sistema)",
      example: "018e9c34-2e0b-70c8-8000-123456789000"
    }),
  slug: z.string().regex(/^[a-z0-9_]+:[a-z0-9_]+$/)
    .meta({ 
      id: "permission_slug",
      description: "Identificador técnico da permissão no formato recurso:ação",
      example: "users:create" 
    }),
  description: z.string().min(5).max(255)
    .meta({ 
      id: "permission_description",
      description: "Explicação legível da finalidade da permissão",
      example: "Permite que o usuário cadastre novos membros na plataforma" 
    }),
  module: z.string().min(2).max(50)
    .meta({ 
      id: "permission_module",
      description: "Módulo funcional ao qual a permissão pertence (para agrupamento UI)",
      example: "iam" 
    })
}).meta({ 
  id: "create_permission_request",
  title: "Create Permission Input",
  description: "Esquema para criação de novas permissões de sistema"
});

export type CreatePermissionDTO = z.input<typeof CreatePermissionSchema>;