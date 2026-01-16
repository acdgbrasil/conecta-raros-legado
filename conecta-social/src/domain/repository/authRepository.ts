import { User } from "../entity/user.js"

export interface AuthRepository {
    login(email: string, password: string): Promise<Object>
    forgotPassword(email: string): Promise<string>
    resetPassword(email: string, code: string, newPassword: string,emailToken:string): Promise<User>
}