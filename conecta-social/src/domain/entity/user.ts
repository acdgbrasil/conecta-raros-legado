
export enum UserRole{
    admin = 'admin',
    user = 'user',
  }

export class User{
    id: number;
    fullName: string;
    email: string;
    password: string;
    crm: string | null;
    role: string;
    isActive:Boolean
    createdAt: Date;
    updatedAt: Date;
    constructor(id: number, fullName: string, email: string, password: string, crm: string | null,role:string ,createdAt: Date, updatedAt: Date,isActive:Boolean){
        this.id = id;
        this.fullName = fullName;
        this.email = email;
        this.password = password;
        this.crm = crm;
        this.role = role;
        this.isActive = isActive
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }
}