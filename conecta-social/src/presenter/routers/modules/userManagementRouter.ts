import { Router } from 'express';
import { UserManagementController } from '../../../useCase/controllers/modules/userManagementController.js';
import { User, UserRole } from '../../../domain/entity/user.js';
import { CustomError } from '../../../infra/error/error.js';

const router = Router();
const controller = new UserManagementController();

/**
 * @swagger
 * /create/adm:
 *   post:
 *     summary: Cria um novo usuário Admin (Requer Super Admin)
 *     tags: [Users]
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
 *               - fullName
 *               - admEmail
 *             properties:
 *               email:
 *                 type: string
 *               fullName:
 *                 type: string
 *               admEmail:
 *                 type: string
 *                 description: Email do Super Admin logado
 *     responses:
 *       201:
 *         description: Admin criado com sucesso
 *       400:
 *         description: Não autorizado ou dados inválidos
 *       500:
 *         description: Erro interno
 */
router.post('/create/adm', async (req, res) => {
    try {
        const { email, fullName, admEmail } = req.body;
        const superAdmEmail = process.env.SUPER_ADM_EMAIL;
        const isSuperAdm = superAdmEmail === admEmail;

        if (!isSuperAdm) {
            const error = new CustomError('Bad Request', 400, 'Bad Request', 'You are not allowed to create a new adm');
            return res.status(400).json(error.toJson('You are not allowed to create a new adm'));
        }

        if (!email) throw new CustomError('Bad Request', 400, 'Bad Request', 'Email is required');
        if (!fullName) throw new CustomError('Bad Request', 400, 'Bad Request', 'Full Name is required');

        const newUser = new User(0, fullName, email, 'Senh@123', null, UserRole.admin.toString(), new Date(), new Date(), true);
        const user = await controller.create(newUser, true);
        return res.status(201).json(user);

    } catch (e) {
        return res.status(500).json(e);
    }
});

/**
 * @swagger
 * /create/user:
 *   post:
 *     summary: Cria um novo usuário padrão (Técnico)
 *     tags: [Users]
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
 *               - fullName
 *               - crm
 *               - admEmail
 *             properties:
 *               email:
 *                 type: string
 *               fullName:
 *                 type: string
 *               crm:
 *                 type: string
 *               admEmail:
 *                 type: string
 *                 description: Email do admin criador
 *     responses:
 *       201:
 *         description: Usuário criado com sucesso
 *       400:
 *         description: Dados inválidos ou permissão negada
 */
router.post('/create/user', async (req, res) => {
    try {
        const { admEmail, email, fullName, crm } = req.body;
        if (!email) throw new CustomError('Bad Request', 400, 'Bad Request', 'Email is required');
        if (!fullName) throw new CustomError('Bad Request', 400, 'Bad Request', 'Full Name is required');
        if (!crm) throw new CustomError('Bad Request', 400, 'Bad Request', 'Crm is required');

        const requestUser = await controller.findByEmail(admEmail) as User;
        const isAdm = requestUser.role === UserRole.admin.toString();

        if (!isAdm) {
            const error = new CustomError('Bad Request', 400, 'Bad Request', 'You are not allowed to create a new user');
            return res.status(400).json(error.toJson('You are not allowed to create a new user'));
        }

        const newUser = new User(0, fullName, email, 'Senh@123', crm, UserRole.user.toString(), new Date(), new Date(), true);
        const user = await controller.create(newUser, false);
        return res.status(201).json(user);

    } catch (e) {
        console.log(e);
        return res.status(500).json(e);
    }
});

export default router;
