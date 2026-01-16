import { User } from "../entity/user.js"

export interface AdmRepository {
    deactivateUser(email:string):Promise<Boolean| Error>
    listAllUsers():Promise<User[] | Error>
}