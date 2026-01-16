import { Router } from 'express';
import { ReferencePersonController } from '../../../useCase/controllers/modules/referencePersonController.js';
import { CustomError } from '../../../infra/error/error.js';
import { ReferencePerson } from '../../../domain/entity/referencePerson.js';
import { converterDataStringParaIsoUtc } from '../../../utils/dateFormater.js';
import { Observations } from '../../../domain/entity/observations.js';

const router = Router();
const controller = new ReferencePersonController();

/**
 * @swagger
 * /reference-persons:
 *   post:
 *     summary: Cria uma nova Pessoa de Referência
 *     tags: [Reference Person]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fullName
 *               - cpf
 *               - birthDate
 *               - biologicalGender
 *               - whoIsObservingId
 *             properties:
 *               fullName: { type: string }
 *               socialName: { type: string }
 *               motherName: { type: string }
 *               cpf: { type: string }
 *               nis: { type: string }
 *               diagnosis: { type: string }
 *               rgNumber: { type: string }
 *               rgUf: { type: string }
 *               rgIssue: { type: string }
 *               rgDateIssue: { type: string }
 *               isShelter: { type: boolean }
 *               localLocalization: { type: string, enum: [URBAN, RURAL] }
 *               cep: { type: string }
 *               address: { type: string }
 *               neighborhood: { type: string }
 *               addressNumber: { type: string }
 *               addressComplement: { type: string }
 *               state: { type: string }
 *               city: { type: string }
 *               phone: { type: string }
 *               whoIsObservingId: { type: string }
 *               birthDate: { type: string, description: "Format DD/MM/YYYY" }
 *               biologicalGender: { type: string }
 *     responses:
 *       201: { description: Created }
 *       400: { description: Bad Request }
 */
router.post('/reference-persons', async (req, res) => {
    try {
        // Renamed 'adress' to 'address' in destructuring to match REST standard, but internal mapping keeps entity consistent
        const { fullName, socialName, motherName, cpf, nis, diagnosis, rgNumber, rgUf, rgIssue, rgDateIssue, isShelter, localLocalization, cep, address, neighborhood, addressNumber, addressComplement, state, city, phone, whoIsObservingId, birthDate, biologicalGender } = req.body;

        if (!birthDate) throw new CustomError('Bad Request', 400, 'Bad Request', 'Birth Date is required');
        if (!biologicalGender) throw new CustomError('Bad Request', 400, 'Bad Request', 'biologicalGender is required');
        if (!whoIsObservingId) throw new CustomError('Bad Request', 400, 'Bad Request', 'Who Is Observing Id is required');
        if (!fullName) throw new CustomError('Bad Request', 400, 'Bad Request', 'Full Name is required');
        if (!socialName) throw new CustomError('Bad Request', 400, 'Bad Request', 'Social Name is required');
        if (!motherName) throw new CustomError('Bad Request', 400, 'Bad Request', 'Mother Name is required');
        if (!cpf) throw new CustomError('Bad Request', 400, 'Bad Request', 'Cpf is required');
        if (!diagnosis) throw new CustomError('Bad Request', 400, 'Bad Request', 'Diagnosis is required');
        if (!rgNumber) throw new CustomError('Bad Request', 400, 'Bad Request', 'Rg Number is required');
        if (!rgUf) throw new CustomError('Bad Request', 400, 'Bad Request', 'Rg Uf is required');
        if (!rgIssue) throw new CustomError('Bad Request', 400, 'Bad Request', 'Rg Issue is required');
        if (!rgDateIssue) throw new CustomError('Bad Request', 400, 'Bad Request', 'Rg Date Issue is required');
        if (typeof isShelter !== "boolean") throw new CustomError('Bad Request', 400, 'Bad Request', 'Is Shelter is required');
        if (!localLocalization) throw new CustomError('Bad Request', 400, 'Bad Request', 'Local Localization is required');
        if (!address) throw new CustomError('Bad Request', 400, 'Bad Request', 'Address is required');
        if (!neighborhood) throw new CustomError('Bad Request', 400, 'Bad Request', 'Neighborhood is required');
        if (!addressNumber) throw new CustomError('Bad Request', 400, 'Bad Request', 'Address Number is required');
        if (!addressComplement) throw new CustomError('Bad Request', 400, 'Bad Request', 'Address Complement is required');
        if (!state) throw new CustomError('Bad Request', 400, 'Bad Request', 'State is required');
        if (!city) throw new CustomError('Bad Request', 400, 'Bad Request', 'City is required');
        if (!phone) throw new CustomError('Bad Request', 400, 'Bad Request', 'Phone is required');

        const convertCorrectFormat = converterDataStringParaIsoUtc(birthDate);
        const birthDateFormatted = new Date(convertCorrectFormat);
        
        // Pass "address" (variable) where "adress" (entity property) is expected. 
        // Note: The Entity "ReferencePerson" still uses "adress". I will map it here.
        const newReferencePerson = new ReferencePerson('0', fullName, socialName, motherName, nis, cpf, diagnosis, rgNumber, biologicalGender, rgUf, rgIssue, rgDateIssue, isShelter, localLocalization, cep, address, neighborhood, addressNumber, addressComplement, state, city, phone, birthDateFormatted, whoIsObservingId);
        
        const referencePerson = await controller.create(newReferencePerson);
        return res.status(201).json(referencePerson);

    } catch (err: any) {
        return res.status(err.statusCode || 500).json({ error: err.message || 'Internal server error' });
    }
});

/**
 * @swagger
 * /reference-persons:
 *   get:
 *     summary: Lista todas as Pessoas de Referência
 *     tags: [Reference Person]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200: { description: OK }
 */
router.get('/reference-persons', async (req, res) => {
    try {
        const list = await controller.listAll();
        return res.status(200).json(list);
    } catch (err) {
        return res.status(500).json(err);
    }
});

/**
 * @swagger
 * /reference-persons/{id}:
 *   get:
 *     summary: Obtém uma Pessoa de Referência pelo ID
 *     tags: [Reference Person]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: OK }
 *       404: { description: Not Found }
 */
router.get('/reference-persons/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const person = await controller.getById(id);
        return res.status(200).json(person);
    } catch (err) {
        return res.status(500).json(err);
    }
});

/**
 * @swagger
 * /reference-persons/{id}/details:
 *   get:
 *     summary: Obtém Pessoa de Referência com Observações
 *     tags: [Reference Person]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: OK }
 */
router.get('/reference-persons/:id/details', async (req, res) => {
    try {
        const { id } = req.params;
        const person = await controller.getWithObservations(id);
        return res.status(200).json(person);
    } catch (err) {
        return res.status(500).json(err);
    }
});

/**
 * @swagger
 * /reference-persons/{id}/observations:
 *   post:
 *     summary: Adiciona observação a uma Pessoa de Referência
 *     tags: [Reference Person]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         description: ID da Pessoa de Referência
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - observation
 *               - whoIsObservingId
 *             properties:
 *               observation: { type: string }
 *               whoIsObservingId: { type: string }
 *     responses:
 *       201: { description: Created }
 */
router.post('/reference-persons/:id/observations', async (req, res) => {
    const { id } = req.params;
    const { observation, whoIsObservingId } = req.body;
    try {
        if (!observation) throw new CustomError('Bad Request', 400, 'Bad Request', 'Observation is required');
        if (!whoIsObservingId) throw new CustomError('Bad Request', 400, 'Bad Request', 'Who Is Observing Id is required');
        
        const newObservation = new Observations(observation, whoIsObservingId);
        const created = await controller.addObservation(newObservation, id);
        return res.status(201).json(created);
    } catch (err) {
        return res.status(500).json(err);
    }
});

export default router;