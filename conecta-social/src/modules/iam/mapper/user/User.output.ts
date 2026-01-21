import { z } from "zod";

export const UserResponseSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  email: z.email(),
  roleId: z.uuid(),
  permissions: z.array(z.string()),
  
  isActive: z.boolean(),
  requiresReset: z.boolean(),
  
  jobTitle: z.string().nullable().optional(),
  department: z.string().nullable().optional(),
  lastLoginAt: z.date().nullable().optional(),
  
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export type UserResponse = z.infer<typeof UserResponseSchema>;

export const ListUsersOutputSchema = z.object({
  data: z.array(UserResponseSchema),
  meta: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
  }),
});

export type ListUsersOutput = z.infer<typeof ListUsersOutputSchema>;