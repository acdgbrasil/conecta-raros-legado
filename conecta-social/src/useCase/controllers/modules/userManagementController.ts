import { User } from "../../../domain/entity/user.js";
import { DatabaseService } from "../../../infra/database/databaseService.js";
import { CryptoService } from "../../../infra/encrypt/encryptService.js";
import { SmtpService } from "../../../infra/smtp/smtpService.js";
import { templateNewUser } from "../../../infra/smtp/resend/templates/template.js";
import { CustomError } from "../../../infra/error/error.js";

export class UserManagementController {
    private db: DatabaseService;
    private crypto: CryptoService;
    private smtp: SmtpService;

    constructor() {
        this.db = new DatabaseService();
        this.crypto = new CryptoService();
        this.smtp = new SmtpService();
    }

    async findByEmail(email: string): Promise<User | Error> {
        return this.db.findByEmail(email);
    }

    async create(user: User, isAdm: boolean): Promise<User | Error> {
        try {
            const hashPass = await this.crypto.hashPass(user.password);
            const newUser = new User(
                user.id,
                user.fullName,
                user.email,
                hashPass,
                user.crm,
                user.role,
                user.createdAt,
                user.updatedAt,
                user.isActive
            );
            
            const userCreate = await this.db.create(newUser, isAdm);
            
            if (userCreate != null) {
                const payload = {
                    from: 'noreply@conectararos.com.br',
                    to: newUser.email,
                    subject: 'Cadastro Realizado com sucesso',
                    html: templateNewUser(user.password),
                };
                
                const emailSent = await this.smtp.sendGenericEmail(
                    payload.from, 
                    payload.to, 
                    payload.subject, 
                    undefined, 
                    payload.html
                );

                if (!emailSent) throw new CustomError('Internal Server Error', 500, 'Internal Server Error', 'Error to send email');
                
                return userCreate;
            }
            throw new CustomError('Internal Server Error', 500, 'Internal Server Error', 'Error to create user');
        } catch (e) {
            throw e;
        }
    }
}
