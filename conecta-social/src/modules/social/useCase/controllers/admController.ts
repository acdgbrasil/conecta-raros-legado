import { User } from "../../domain/entity/user.js";
import { AdmRepository } from "../../domain/repository/admRepository.js";
import { DatabaseService } from "../../infra/database/databaseService.js";

export class AdmController implements AdmRepository{
   
    
    async deactivateUser(email: string): Promise<Boolean | Error> {
        try{
            const databaseService = new DatabaseService()
            const users = await databaseService.deactivateUser(email)
            return users
        }catch(err){
            throw err
        }
    }
    async listAllUsers(): Promise<User[] | Error> {
        try{
            const databaseService = new DatabaseService()
            const users = await databaseService.listAllUsers()
            return users
        }catch(err){
            throw err
        }
    }

}