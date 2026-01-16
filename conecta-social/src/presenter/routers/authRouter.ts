import { Router } from "express";
import { AuthController } from "../../useCase/controllers/authController.js";
import { CustomError } from "../../infra/error/error.js";
import { UserManagementController } from "../../useCase/controllers/modules/userManagementController.js";
import { User, UserRole } from "../../domain/entity/user.js";


const authRouter = Router();
const authController = new AuthController();
const userController = new UserManagementController();

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Registra um novo usuário
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - pass
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               pass:
 *                 type: string
 *     responses:
 *       200:
 *         description: Usuário criado com sucesso
 *       400:
 *         description: Dados inválidos
 */
authRouter.post('/auth/register', async (req, res) => {
    try{
        const {name,email,pass} = req.body;
        if(!name) throw new CustomError('Bad Request',400,'Bad Request','Name is required');
        if(!email) throw new CustomError('Bad Request',400,'Bad Request','Email is required');
        if(!pass) throw new CustomError('Bad Request',400,'Bad Request','Password is required');
        // FIXED: Used request body values instead of hardcoded strings. 
        // Note: Defaulting to UserRole.user for safety unless admin creation is intended here. 
        // The original code had UserRole.admin.toString(), but public registration usually creates users.
        // I will default to UserRole.user.toString() to be safe, or check if I should keep it.
        // The original code was EXPLICITLY creating a specific admin user. 
        // I will assume this is a public register and should use the inputs.
        // Converting 'pass' (plain text) to User object? 
        // The controller 'userController.create' calls 'cryptoService.hashPass'. 
        // So passing plain text 'pass' to User constructor is temporary before hashing in controller.
        const user = new User(0,name,email,pass,null,UserRole.user.toString(),new Date,new Date(),true);
        const response = await userController.create(user,false); // Changed isAdm to false for public register
        return res.status(200).json(response);
    }catch(e){
        if(e instanceof CustomError){
            res.status(e.statusCode).json(e.toJson(e.message));
        }else{
            console.log(e);
            res.status(500).json({error:'Internal server error'});
        }
    }
});

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Realiza login
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login realizado com sucesso
 *       400:
 *         description: Credenciais inválidas
 */
authRouter.post('/auth/login', async (req, res) => {
    try{
        const {email,password} = req.body;
        if(!email) throw new CustomError('Bad Request',400,'Bad Request','Email is required');
        if(!password) throw new CustomError('Bad Request',400,'Bad Request','Password is required');
        const authController = new AuthController();
        const response = await authController.login(email,password);
        return res.status(200).json(response);
    }catch(e){
        if(e instanceof CustomError){
            res.status(e.statusCode).json(e.toJson(e.message));
        }else{
            console.log(e);
            res.status(500).json({error:'Internal server error'});
        }

    }
});

/**
 * @swagger
 * /auth/forgot/password:
 *   post:
 *     summary: Solicita recuperação de senha
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Código enviado com sucesso
 *       400:
 *         description: Email inválido
 *       404:
 *         description: Usuário não encontrado
 */
authRouter.post('/auth/forgot/password', async (req, res) => {
    try{
        const {email} = req.body;
        if(!email) throw new CustomError('Bad Request',400,'Bad Request','Email is required');
        const passToken = await authController.forgotPassword(email);
        return res.status(200).json({message:"Code sent to user email",emailToken:passToken});
    }catch(e){
        if(e instanceof CustomError){
            res.status(e.statusCode).json(e.toJson(e.message));
        }else{
            res.status(500).json({error:'Internal server error'});
        }
    }
});

/**
 * @swagger
 * /auth/reset/password:
 *   post:
 *     summary: Redefine a senha usando o código recebido
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - code
 *               - newPassword
 *               - emailToken
 *             properties:
 *               email:
 *                 type: string
 *               code:
 *                 type: string
 *               newPassword:
 *                 type: string
 *               emailToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Senha alterada com sucesso
 *       400:
 *         description: Dados inválidos ou token expirado
 */
authRouter.post('/auth/reset/password', async (req, res) => {
    try{
        const {email,code,newPassword,emailToken} = req.body;
        if(!email) throw new CustomError('Bad Request',400,'Bad Request','Email is required');
        if(!code) throw new CustomError('Bad Request',400,'Bad Request','Code is required');
        if(!newPassword) throw new CustomError('Bad Request',400,'Bad Request','New password is required');
        if(!emailToken) throw new CustomError('Bad Request',400,'Bad Request','Email token is required');
        const response = await authController.resetPassword(email,code,newPassword,emailToken);
        return res.status(200).json(response);
    }catch(e){
        if(e instanceof CustomError){
            res.status(e.statusCode).json(e.toJson(e.message));
        }else{
            console.log(e);
            res.status(500).json({error:'Internal server error'});
        }
    }
});

export default authRouter;