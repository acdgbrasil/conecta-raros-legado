import { Hono } from "hono";
import { AuthService } from "../../services/AuthService.js";
import { CustomError } from "../../infra/error/error.js";

const authRouter = new Hono();
const authService = new AuthService();

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Registra um novo usuário (Isolado)
 *     tags: [Auth]
 */
authRouter.post('/auth/register', async (c) => {
    try {
        const { name, email, pass } = await c.req.json();
        if (!name || !email || !pass) {
            throw new CustomError('Bad Request', 400, 'Bad Request', 'Missing fields');
        }
        
        // Usa o serviço isolado
        const response = await authService.registerUser(name, email, pass, false);
        return c.json(response, 200);
    } catch (e: any) {
        return c.json(e.toJson ? e.toJson(e.message) : { error: e.message }, e.statusCode || 500);
    }
});

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Realiza login (Isolado)
 *     tags: [Auth]
 */
authRouter.post('/auth/login', async (c) => {
    try {
        const { email, password } = await c.req.json();
        if (!email || !password) throw new CustomError('Bad Request', 400, 'Bad Request', 'Missing credentials');
        
        const response = await authService.login(email, password);
        return c.json(response, 200);
    } catch (e: any) {
        return c.json(e.toJson ? e.toJson(e.message) : { error: e.message }, e.statusCode || 500);
    }
});

// Forgot/Reset password can be migrated similarly, keeping it simple for now to prove isolation
// ...

export default authRouter;