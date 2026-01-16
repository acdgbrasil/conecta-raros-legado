export enum UserRole{
    admin = 'admin',
    user = 'user',
  }

export interface User {
    id: number;
    fullName: string;
    email: string;
    crm: string | null;
    role: UserRole;
    isActive:Boolean
    createdAt: Date;
    updatedAt: Date;
}