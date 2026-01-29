// Identificadores tipados para evitar Primitive Obsession (Stringly Typed)

export type UserId = string & { readonly __brand: unique symbol };
export type RoleId = string & { readonly __brand: unique symbol };
export type PermissionId = string & { readonly __brand: unique symbol };
export type PersonId = string & { readonly __brand: unique symbol }; // Golden Record ID

// Helpers para casting seguro (Factories)
export const createUserId = (id: string) => id as UserId;
export const createRoleId = (id: string) => id as RoleId;
export const createPermissionId = (id: string) => id as PermissionId;
export const createPersonId = (id: string) => id as PersonId;
