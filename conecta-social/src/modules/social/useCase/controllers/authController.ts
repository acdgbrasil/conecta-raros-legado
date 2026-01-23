import { User } from "../../domain/entity/user.js";
import { AuthRepository } from "../../domain/repository/authRepository.js";
import { DatabaseService } from "../../infra/database/databaseService.js";
import { FIVE_MINUTES } from "../../infra/database/mongodb/mongoModels.js";
import { verifyPass } from "../../infra/encrypt/bcrypt/bcryptDto.js";
import { CryptoService } from "../../infra/encrypt/encryptService.js";
import { CustomError } from "../../infra/error/error.js";
import { createPassEmailToken, createToken } from "../../infra/jwt/jwtToken.js";
import { templateResetPassword } from "../../infra/smtp/resend/templates/template.js";
import { SmtpService } from "../../infra/smtp/smtpService.js";

const ONE_MOUTH = 60 * 60 * 24 * 30;

export class AuthController implements AuthRepository{
    
    async login(email: string, password: string): Promise<Object> {
        try{
            const databaseService = new DatabaseService();
            const hasUser = await databaseService.findByEmail(email) as User;
            if(!(hasUser.email == email)) throw new CustomError('INVALID_EMAIL', 400,'INVALID_EMAIL', 'Invalid email');
            const passIsValid = await verifyPass(password,hasUser.password);
            if(!hasUser.isActive) throw new CustomError('INVALID_USER', 400,'INVALID_USER', 'The user you want to access are disabled');
            if(!passIsValid) throw new CustomError('INVALID_PASSWORD', 400,'INVALID_PASSWORD', 'Invalid password');
            const jwtToken = createToken(hasUser.id.toString(),ONE_MOUTH);
            return {user:hasUser,token:jwtToken};
        }catch(e){
            throw e;
        }
    }
    async forgotPassword(email: string): Promise<string> {
        try{
            const databaseService = new DatabaseService();
            const hasUser = await databaseService.findByEmail(email);
            if(!hasUser) throw new CustomError('USER_NOT_FOUND', 404,'USER_NOT_FOUND', 'User not found');
            const passToken = createPassEmailToken(email,FIVE_MINUTES);
            const expiredCode = await databaseService.forgotPassword(email);
            const smtp = new SmtpService();
            const responseEmail = await smtp.sendGenericEmail('noreply@conectararos.com.br',email,'Reset de Senha',undefined,templateResetPassword(expiredCode));
            if(!responseEmail) throw new CustomError('Internal Server Error',500,'Internal Server Error','Error to send email')
            return passToken;
        }catch(e){
            throw e;
        }
    }

    async resetPassword(email: string, code: string, newPassword: string,emailToken:string): Promise<User> {
        try{
            const databaseService = new DatabaseService();
            const encrypt = new CryptoService();
            const hashPass = await encrypt.hashPass(newPassword);
            const user = databaseService.resetPassword(email,code,hashPass,emailToken);
            return user;
        }catch(e){
            throw e;
        }
    }

}