import { Hono } from "hono";
import { CustomError } from "../../infra/error/error.js";
import { AuthService } from "../../services/AuthService.js";

const admRouter = new Hono();
const authService = new AuthService();

/**
 * @swagger
 * /adm/users:
 *   get:
 *     summary: Lista todos os usuários (Requer Super Admin)
 *     tags: [Admin]
 */
admRouter.get('/adm/users', async (c) => {
    try {
        const userPayload = c.get('user') as any;
        const userId = userPayload?.pay;
        
        // Verifica se é Super Admin (Isolado no AuthService seria ideal, mas por simplicidade aqui)
        const user = await authService.getUserById(userId);
        if (user?.email !== process.env.SUPER_ADM_EMAIL) {
            throw new CustomError('Unauthorized', 401, 'Unauthorized', 'Admin access required');
        }
        
        const users = await authService.getAllUsers();
        return c.json({ response: users }, 200);
    } catch (e: any) {
        return c.json(e.toJson ? e.toJson(e.message) : { error: e.message }, e.statusCode || 500);
    }
});

/**
 * @swagger
 * /adm/deactivate/user:
 *   patch:
 *     summary: Desativa um usuário (Requer Super Admin)
 *     tags: [Admin]
 */
admRouter.patch('/adm/deactivate/user', async (c) => {
    try {
        const { email } = await c.req.json();
        const userPayload = c.get('user') as any;
        const userId = userPayload?.pay;

        const user = await authService.getUserById(userId);
        if (user?.email !== process.env.SUPER_ADM_EMAIL) {
            throw new CustomError('Unauthorized', 401, 'Unauthorized', 'Admin access required');
        }
        
        const success = await authService.deactivate(email);
        if (success) return c.json({ "message": "User deactivated" }, 200);
        return c.json({ "message": "Failed to deactivate" }, 400);
    } catch (e: any) {
        return c.json(e.toJson ? e.toJson(e.message) : { error: e.message }, e.statusCode || 500);
    }
});

export default admRouter;