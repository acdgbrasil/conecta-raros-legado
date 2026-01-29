import { z } from "zod";

export const ListUsersQuerySchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(10),
  search: z.string().optional()
});

export type ListUsersQueryDTO = z.input<typeof ListUsersQuerySchema>;
