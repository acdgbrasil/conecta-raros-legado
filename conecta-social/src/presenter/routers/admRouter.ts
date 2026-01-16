import { response, Router } from "express";
import { CustomError } from "../../infra/error/error.js";
import { AdmController } from "../../useCase/controllers/admController.js";
import { DatabaseService } from "../../infra/database/databaseService.js";

const admRouter = Router();

const admController = new AdmController()

admRouter.get('/adm/list/all/:admEmail',async (req,res)=>{
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