import { Router } from 'express';
import { FamilyController } from '../../../useCase/controllers/modules/familyController.js';
import { CustomError } from '../../../infra/error/error.js';
import { FamilyCompositionPerson, Documents, Pregnant } from '../../../domain/entity/familyComposition.js';
import { Observations } from '../../../domain/entity/observations.js';
import { FamilyAndCommunity } from '../../../domain/entity/familyAndCommunity.js';
import { FamilyComunitaryConvivation } from '../../../domain/entity/familyComunitaryConvivation.js';
import { FamilyEventlyBenefits } from '../../../domain/entity/familyEnvetlyBenefits.js';

const router = Router();
const controller = new FamilyController();

// Family Person
/**
 * @swagger
 * /families/{familyId}/members:
 *   post:
 *     summary: Adiciona um membro à família
 *     tags: [Family]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: familyId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fullname
 *               - birthDate
 *               - biologicalGender
 *               - kinship
 *             properties:
 *               fullname: { type: string }
 *               birthDate: { type: string, format: date }
 *               biologicalGender: { type: string }
 *               kinship: { type: number }
 *               personWithDisabilities: { type: boolean }
 *     responses:
 *       201: { description: Member Created }
 */
router.post('/families/:familyId/members', async (req, res) => {
    try {
        const { familyId } = req.params;
        const { fullname, birthDate, biologicalGender, kinship, personWithDisabilities } = req.body;

        if (!fullname) throw new CustomError('Bad Request', 400, 'Bad Request', 'Full Name is required');
        if (!birthDate) throw new CustomError('Bad Request', 400, 'Bad Request', 'Birth Date is required');
        if (!biologicalGender) throw new CustomError('Bad Request', 400, 'Bad Request', 'biologicalGender is required');
        if (!kinship) throw new CustomError('Bad Request', 400, 'Bad Request', 'Kinship is required');
        if (typeof personWithDisabilities !== "boolean") throw new CustomError('Bad Request', 400, 'Bad Request', 'Person With Disabilities is required');

        const documents = new Documents(false, false, false, false, false);
        const dateArray = birthDate.split('/');
        const date = new Date(dateArray[2], dateArray[1], dateArray[0]);
        const familyCompositionPerson = new FamilyCompositionPerson(fullname, date, biologicalGender, personWithDisabilities, documents, kinship);
        
        const result = await controller.createFamilyPerson(familyCompositionPerson, familyId);
        return res.status(201).json(result);
    } catch (e: any) {
        res.status(e.statusCode || 500).json(e);
    }
});

/**
 * @swagger
 * /families/{familyId}/members:
 *   get:
 *     summary: Lista membros da família
 *     tags: [Family]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: familyId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: OK }
 */
router.get('/families/:familyId/members', async (req, res) => {
    try {
        const { familyId } = req.params;
        const result = await controller.getFamilyCompositionPersons(familyId);
        return res.status(200).json(result);
    } catch (e: any) {
        res.status(e.statusCode || 500).json(e);
    }
});

/**
 * @swagger
 * /families/{familyId}/observations:
 *   post:
 *     summary: Adiciona observação à família
 *     tags: [Family]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: familyId
 *         required: true
 *         schema: { type: string }
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
router.post('/families/:familyId/observations', async (req, res) => {
    try {
        const { familyId } = req.params;
        const { observation, whoIsObservingId } = req.body;
        if (!observation) throw new CustomError('Bad Request', 400, 'Bad Request', 'Observation is required');
        if (!whoIsObservingId) throw new CustomError('Bad Request', 400, 'Bad Request', 'Who Is Observing Id is required');
        
        const newObservation = new Observations(observation, whoIsObservingId);
        const result = await controller.addObservation(newObservation, familyId);
        return res.status(201).json(result);
    } catch (e: any) {
        res.status(e.statusCode || 500).json(e);
    }
});

// Documents and Ethnicity
/**
 * @swagger
 * /families/{familyId}/members/{memberId}/documents:
 *   put:
 *     summary: Atualiza documentos de um membro
 *     tags: [Family]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: familyId
 *         required: true
 *         schema: { type: string }
 *       - in: path
 *         name: memberId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - document
 *             properties:
 *               document:
 *                 type: array
 *                 items: { type: boolean }
 *                 description: "[cn, rg, ctps, cpf, te]"
 *     responses:
 *       200: { description: Updated }
 */
router.put('/families/:familyId/members/:memberId/documents', async (req, res) => {
    try {
        const { familyId, memberId } = req.params;
        const { document } = req.body;

        const documents = new Documents(document[0], document[1], document[2], document[3], document[4]);
        const result = await controller.createDocuments(documents, familyId, memberId);
        return res.status(200).json(result); // Changed to 200 as it's an update
    } catch (e: any) {
        res.status(e.statusCode || 500).json(e);
    }
});

/**
 * @swagger
 * /families/{familyId}/ethnicity:
 *   patch:
 *     summary: Define especificações étnicas da família
 *     tags: [Family]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: familyId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - ethnicalSpecifications
 *             properties:
 *               ethnicalSpecifications: { type: string }
 *     responses:
 *       200: { description: Updated }
 */
router.patch('/families/:familyId/ethnicity', async (req, res) => {
    try {
        const { familyId } = req.params;
        // Corrected typo from 'etnical' to 'ethnical' in API, mapped to internal 'etnical'
        const { ethnicalSpecifications } = req.body; 
        
        if (!ethnicalSpecifications) throw new CustomError('Bad Request', 400, 'Bad Request', 'Ethnical Specifications is required');
        
        const result = await controller.createEtnicalSpecifications(ethnicalSpecifications, familyId);
        return res.status(200).json(result);
    } catch (e: any) {
        res.status(e.statusCode || 500).json(e);
    }
});

// Community
/**
 * @swagger
 * /families/{familyId}/community-ties:
 *   put:
 *     summary: Atualiza dados de família e comunidade
 *     tags: [Family]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: familyId
 *         required: true
 *         schema: { type: string }
 *         description: "ID da Entidade FamilyAndCommunity (Nota: Atualmente o sistema pede este ID específico, não o da Família)"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               yearsInState: { type: number }
 *               awaysLivingInState: { type: boolean }
 *               yearsInDistrict: { type: number }
 *               awaysLivingInDistrict: { type: boolean }
 *               yearsInNeighborhood: { type: number }
 *               awaysLivingInNeighborhood: { type: boolean }
 *               hasVictimOfThreatsOrDiscrimination: { type: boolean }
 *               hasNearbySupportNetwork: { type: boolean }
 *               hasNeighborSupportNetwork: { type: boolean }
 *               hasParticipatesInSupportGroups: { type: boolean }
 *               hasParticipatesInSocialMovements: { type: boolean }
 *               hasNoAccessToLeisureActivities: { type: boolean }
 *               hasElderWithoutLeisureOrSocialInteraction: { type: boolean }
 *               hasDependentsLeftAloneAtHome: { type: boolean }
 *               relationshipEvaluationByTechnician: { type: string }
 *               parentChildRelationshipEvaluation: { type: string }
 *               siblingRelationshipEvaluation: { type: string }
 *               conflictWithOtherResidents: { type: string }
 *     responses:
 *       200: { description: Updated }
 */
router.put('/families/:familyId/community-ties', async (req, res) => {
    try {
        // NOTE: The original logic uses 'familyAndCommunityId'. If the frontend passes the Family ID 
        // but the backend expects a specific sub-document ID, we might have a mismatch. 
        // For now, I'm assuming 'familyId' in URL maps to the expected ID by the controller.
        const { familyId } = req.params; 
        const { yearsInState, awaysLivingInState, yearsInDistrict, awaysLivingInDistrict, yearsInNeighborhood, awaysLivingInNeighborhood, hasVictimOfThreatsOrDiscrimination, hasNearbySupportNetwork, hasNeighborSupportNetwork, hasParticipatesInSupportGroups, hasParticipatesInSocialMovements, hasNoAccessToLeisureActivities, hasElderWithoutLeisureOrSocialInteraction, hasDependentsLeftAloneAtHome, relationshipEvaluationByTechnician, parentChildRelationshipEvaluation, siblingRelationshipEvaluation, conflictWithOtherResidents } = req.body;

        const familyCommunity = new FamilyAndCommunity(yearsInState, awaysLivingInState, yearsInDistrict, awaysLivingInDistrict, yearsInNeighborhood, awaysLivingInNeighborhood, hasVictimOfThreatsOrDiscrimination, hasNearbySupportNetwork, hasNeighborSupportNetwork, hasParticipatesInSupportGroups, hasParticipatesInSocialMovements, hasNoAccessToLeisureActivities, hasElderWithoutLeisureOrSocialInteraction, hasDependentsLeftAloneAtHome, relationshipEvaluationByTechnician, parentChildRelationshipEvaluation, siblingRelationshipEvaluation, conflictWithOtherResidents, true);
        
        const result = await controller.createFamilyAndCommunity(familyCommunity, familyId);
        return res.status(200).json(result);
    } catch (e: any) {
        res.status(e.statusCode || 500).json(e);
    }
});

/**
 * @swagger
 * /families/{familyId}/community-ties/observations:
 *   post:
 *     summary: Adiciona observação sobre comunidade
 *     tags: [Family]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: familyId
 *         required: true
 *         schema: { type: string }
 *         description: ID da entidade FamilyAndCommunity
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
router.post('/families/:familyId/community-ties/observations', async (req, res) => {
    try {
        const { familyId } = req.params;
        const { observation, whoIsObservingId } = req.body;
        if (!observation) throw new CustomError('Bad Request', 400, 'Bad Request', 'Observation is required');
        
        const newObs = new Observations(observation, whoIsObservingId);
        const result = await controller.addFamilyAndCommunityObservation(familyId, newObs);
        return res.status(201).json(result);
    } catch (e: any) {
        res.status(e.statusCode || 500).json(e);
    }
});

// Benefits
/**
 * @swagger
 * /families/{familyId}/benefits:
 *   post:
 *     summary: Cria registro de benefícios eventuais
 *     tags: [Family]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: familyId
 *         required: true
 *         schema: { type: string }
 *         description: ID da entidade Benefits
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               date: { type: string, format: date }
 *               typeOfBenefit: { type: number }
 *               nBirthDate: { type: string }
 *               nCpf: { type: string }
 *     responses:
 *       201: { description: Created }
 */
router.post('/families/:familyId/benefits', async (req, res) => {
    try {
        const { familyId } = req.params;
        const { date, typeOfBenefit, nBirthDate, nCpf } = req.body;
        
        const dateFormater = new Date(date);
        const benefit = new FamilyEventlyBenefits(dateFormater, typeOfBenefit, nBirthDate, nCpf, true);
        
        const result = await controller.createBenefits(benefit, familyId);
        return res.status(201).json(result);
    } catch (e: any) {
        res.status(e.statusCode || 500).json(e);
    }
});

// Community Convivation
/**
 * @swagger
 * /members/{memberId}/community-convivence:
 *   post:
 *     summary: Cria convivência comunitária para um membro
 *     tags: [Family]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: memberId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - familyCompositionId
 *             properties:
 *               dateOfInitJson: { type: string, format: date }
 *               dateOfFinishJson: { type: string, format: date }
 *               unity: { type: number }
 *               serviceType: { type: number }
 *               familyCompositionId: { type: string }
 *     responses:
 *       201: { description: Created }
 */
router.post('/members/:memberId/community-convivence', async (req, res) => {
    try {
        const { memberId } = req.params;
        const { dateOfInitJson, dateOfFinishJson, unity, serviceType, familyCompositionId } = req.body;
        
        const dateOfInit = new Date(dateOfInitJson);
        const dateOfFinish = new Date(dateOfFinishJson);
        const convivation = new FamilyComunitaryConvivation(dateOfInit, dateOfFinish, unity, serviceType);
        
        const result = await controller.createComunitaryConvivation(convivation, familyCompositionId, memberId);
        return res.status(201).json(result);
    } catch (e: any) {
        res.status(e.statusCode || 500).json(e);
    }
});

export default router;