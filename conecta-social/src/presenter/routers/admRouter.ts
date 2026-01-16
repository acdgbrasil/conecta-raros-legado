import { response, Router } from "express";
import { CustomError } from "../../infra/error/error.js";
import { AdmController } from "../../useCase/controllers/admController.js";
import { DatabaseService } from "../../infra/database/databaseService.js";

const admRouter = Router();

const admController = new AdmController()

/**
 * @swagger
 * /adm/users:
 *   get:
 *     summary: Lista todos os usuários (Requer Super Admin)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de usuários retornada com sucesso
 *       401:
 *         description: Não autorizado (Não é Super Admin)
 */
admRouter.get('/adm/users',async (req,res)=>{
    try{
        // SECURE AUTH CHECK
        // 1. Get User ID from Token (set by verifyToken middleware)
        const userId = res.locals.user?.pay;
        if(!userId) throw new CustomError('Unauthorized',401,'Unauthorized','Invalid token payload');

        // 2. Fetch User from DB
        const db = new DatabaseService();
        const user = await db.findById(userId);
        
        // 3. Verify Identity
        const superAdmEmail = process.env.SUPER_ADM_EMAIL
        const isSuperAd = user.email === superAdmEmail; // Enforce super admin check based on authenticated user
        
        if(!isSuperAd){
            throw new CustomError('Unauthorized',401,'Unauthorized','Your access is denied, because you are not allowed');
        }
        
        const users = await admController.listAllUsers()
        return res.status(200).json({response:users})
    
    }catch(e){
        if(e instanceof CustomError){
            res.status(e.statusCode).json(e.toJson(e.message));
        }else{
            res.status(500).json({error:'Internal server error'});
        }
    }
})

/**
 * @swagger
 * /adm/deactivate/user:
 *   patch:
 *     summary: Desativa um usuário (Requer Super Admin)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
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
 *                 description: Email do usuário a ser desativado
 *     responses:
 *       200:
 *         description: Usuário desativado com sucesso
 *       401:
 *         description: Não autorizado
 *       404:
 *         description: Usuário não encontrado
 */
admRouter.patch('/adm/deactivate/user',async(req,res)=>{
    try{
        const {email} = req.body // Removed admEmail from body reliance
        
        // SECURE AUTH CHECK
        const userId = res.locals.user?.pay;
        if(!userId) throw new CustomError('Unauthorized',401,'Unauthorized','Invalid token payload');

        const db = new DatabaseService();
        const user = await db.findById(userId);

        const superAdmEmail = process.env.SUPER_ADM_EMAIL
        const isSuperAd = user.email === superAdmEmail
        
        if(!isSuperAd){
            throw new CustomError('Unauthorized',401,'Unauthorized','Your access is denied, because you are not allowed');
        }
        
        const hasSuccesfull = await admController.deactivateUser(email)
        if(hasSuccesfull) return res.status(200).json({"message": "User has been successfully deactivated!"})
        return res.status(200).json({"message": "Failed to deactivate user!"})
    
    }catch(e){
        if(e instanceof CustomError){
            res.status(e.statusCode).json(e.toJson(e.message));
        }else{
            res.status(500).json({error:'Internal server error'});
        }
    }
})

export default admRouter;