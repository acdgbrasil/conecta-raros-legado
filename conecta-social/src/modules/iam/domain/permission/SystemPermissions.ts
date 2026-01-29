/**
 * SystemPermissions - A Fonte da Verdade para as capacidades do software.
 * Definido na Camada de Domínio pois representa regras fundamentais de negócio
 * sobre o que o sistema é capaz de realizar.
 */
export const SystemPermissions = {
  USERS: {
    CREATE: "users:create",
    READ: "users:read",
    UPDATE: "users:update",
    STATUS: "users:status", // Last Admin Protection
  },
  ROLES: {
    CREATE: "roles:create", // Create Custom Role
    READ: "roles:read",
    UPDATE: "roles:update", // Assign Permissions to Role
    DELETE: "roles:delete",
    ASSIGN: "roles:assign", // Assign Role to User
  },
  PERMISSIONS: {
    READ: "permissions:read", // Catalog View
  }
} as const;

export type SystemPermissionSlug = 
  | typeof SystemPermissions.USERS[keyof typeof SystemPermissions.USERS]
  | typeof SystemPermissions.ROLES[keyof typeof SystemPermissions.ROLES]
  | typeof SystemPermissions.PERMISSIONS[keyof typeof SystemPermissions.PERMISSIONS];
