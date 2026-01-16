import { Router } from 'express';
import { ConditionsController } from '../../../useCase/controllers/modules/conditionsController.js';
import { CustomError } from '../../../infra/error/error.js';
import { HomeConditions } from '../../../domain/entity/homeConditions.js';
import { Observations } from '../../../domain/entity/observations.js';
import { WorkCondition } from '../../../domain/entity/workCondition.js';
import { WorkConditionPerson, EducationConditionPerson, OcurruncyBolsaFamilia, Pregnant } from '../../../domain/entity/familyComposition.js';
import { HealthyCondition, HealthyConditionStruct } from '../../../domain/entity/healthCondition.js';
import { HealthyConditionFamily } from '../../../domain/entity/familyHealthyCondition.js';

const router = Router();
const controller = new ConditionsController();

// --- HOME ---
/**
 * @swagger
 * /families/{familyId}/home-conditions:
 *   put:
 *     summary: Atualiza condições habitacionais
 *     tags: [Home Conditions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: familyId
 *         required: true
 *         schema: { type: string }
 *         description: "ID da entidade HomeConditions"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               typeResidence: { type: string }
 *               materialOfExternalWalls: { type: string }
 *               hasAcessEnergy: { type: string }
 *               waterSupply: { type: string }
 *               sewageDisposal: { type: string }
 *               garbageCollection: { type: string }
 *               hasWasteCollection: { type: boolean }
 *               homeConditionIsInRiskArea: { type: boolean }
 *               difficultyToAccessHome: { type: boolean }
 *               hasHomeInsurance: { type: boolean }
 *               hasHomeInsuranceValue: { type: number }
 *               numberOfRooms: { type: number }
 *               numberOfBedrooms: { type: number }
 *               numberOfPeapleInBedrooms: { type: number }
 *     responses:
 *       200: { description: Updated }
 */
router.put('/families/:familyId/home-conditions', async (req, res) => {
    try {
        const { familyId } = req.params; // Mapped to homeConditionsId in original logic
        const { typeResidence, materialOfExternalWalls, hasAcessEnergy, waterSupply, sewageDisposal, garbageCollection, hasWasteCollection, homeConditionIsInRiskArea, difficultyToAccessHome, hasHomeInsurance, hasHomeInsuranceValue, numberOfRooms, numberOfBedrooms, numberOfPeapleInBedrooms } = req.body;
        
        const homeConditions = new HomeConditions(
            typeResidence, materialOfExternalWalls, hasAcessEnergy, waterSupply, sewageDisposal, garbageCollection, 
            hasWasteCollection, homeConditionIsInRiskArea, difficultyToAccessHome, hasHomeInsurance, 
            hasHomeInsuranceValue, numberOfRooms, numberOfBedrooms, numberOfPeapleInBedrooms
        );

        const result = await controller.createHomeConditions(homeConditions, familyId);
        return res.status(200).json(result);
    } catch (e: any) {
        res.status(e.statusCode || 500).json(e);
    }
});

/**
 * @swagger
 * /families/{familyId}/home-conditions/observations:
 *   post:
 *     summary: Adiciona observação às condições habitacionais
 *     tags: [Home Conditions]
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
router.post('/families/:familyId/home-conditions/observations', async (req, res) => {
    try {
        const { familyId } = req.params;
        const { observation, whoIsObservingId } = req.body;
        if (!observation) throw new CustomError('Bad Request', 400, 'Bad Request', 'Observation is required');
        
        const newObservation = new Observations(observation, whoIsObservingId);
        const result = await controller.addHomeObservation(newObservation, familyId);
        return res.status(201).json(result);
    } catch (e: any) {
        res.status(e.statusCode || 500).json(e);
    }
});

// --- WORK ---
/**
 * @swagger
 * /members/{memberId}/work-conditions:
 *   put:
 *     summary: Atualiza condições de trabalho de um membro
 *     tags: [Work Conditions]
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
 *               - familyCompositionID
 *               - workConditionId
 *             properties:
 *               hasSocialIncome: { type: boolean }
 *               perCapitaIncome: { type: number }
 *               bolsaFamiliaValue: { type: number }
 *               bpcValue: { type: number }
 *               petiValue: { type: number }
 *               othersValue: { type: number }
 *               bcpBenefitPerson: { type: array, items: { type: string } }
 *               hasRetiredPerson: { type: array, items: { type: string } }
 *               totalFamilyIncome: { type: number }
 *               totalPerCapitaIncome: { type: number }
 *               workConditionBody: { type: string }
 *               hasWorkCard: { type: boolean }
 *               workQualification: { type: string }
 *               workValue: { type: number }
 *               familyCompositionID: { type: string }
 *               workConditionId: { type: string }
 *     responses:
 *       200: { description: Updated }
 */
router.put('/members/:memberId/work-conditions', async (req, res) => {
    try {
        const { memberId } = req.params;
        const { hasSocialIncome, perCapitaIncome, bolsaFamiliaValue, bpcValue, petiValue, othersValue, bcpBenefitPerson, hasRetiredPerson, totalFamilyIncome, totalPerCapitaIncome, workConditionBody, hasWorkCard, workQualification, workValue, familyCompositionID, workConditionId } = req.body;
        
        const workCondition = new WorkCondition(hasSocialIncome, perCapitaIncome, hasSocialIncome, bolsaFamiliaValue, bpcValue, petiValue, othersValue, bcpBenefitPerson, hasRetiredPerson, totalFamilyIncome, totalPerCapitaIncome);
        const workConditionPerson = new WorkConditionPerson(true, workConditionBody, hasWorkCard, workQualification, workValue);
        
        const result = await controller.createWorkCondition(workCondition, workConditionPerson, familyCompositionID, memberId, workConditionId);
        return res.status(200).json(result);
    } catch (e: any) {
        res.status(e.statusCode || 500).json(e);
    }
});

// --- HEALTH ---
/**
 * @swagger
 * /members/{memberId}/health-conditions:
 *   put:
 *     summary: Atualiza condições de saúde de um membro
 *     tags: [Health Conditions]
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
 *               - healthyConditionId
 *               - familyCompositionID
 *             properties:
 *               hasFamilyMemberNeedsConstantCare: { type: boolean }
 *               hasFamilyMemberNeedsConstantCareList: { type: array, items: { type: object } }
 *               hasFamilyMemberHasAlimentarInsecure: { type: boolean }
 *               hasFamilyMemberUsesControlledMedication: { type: boolean }
 *               hasFamilyMemberUsesControlledMedicationList: { type: array, items: { type: object } }
 *               hasFamilyMemberAbusesAlcohol: { type: boolean }
 *               hasFamilyMemberAbusesAlcoholList: { type: array, items: { type: object } }
 *               hasFamilyMemberAbusesDrugs: { type: boolean }
 *               hasFamilyMemberAbusesDrugsList: { type: array, items: { type: object } }
 *               hasFamilyMemberSevereIllness: { type: boolean }
 *               hasFamilyMemberSevereIllnessList: { type: array, items: { type: object } }
 *               healthyConditionId: { type: string }
 *               typeOfDeficiency: { type: string }
 *               hasHealthyNeeds: { type: boolean }
 *               whoIsResponsibleForHelp: { type: string }
 *               pregnancyMonths: { type: number }
 *               hasPreNatal: { type: boolean }
 *               familyCompositionID: { type: string }
 *     responses:
 *       200: { description: Updated }
 */
router.put('/members/:memberId/health-conditions', async (req, res) => {
    try {
        const { memberId } = req.params;
        const { hasFamilyMemberNeedsConstantCare, hasFamilyMemberNeedsConstantCareList, hasFamilyMemberHasAlimentarInsecure, hasFamilyMemberUsesControlledMedication, hasFamilyMemberUsesControlledMedicationList, hasFamilyMemberAbusesAlcohol, hasFamilyMemberAbusesAlcoholList, hasFamilyMemberAbusesDrugs, hasFamilyMemberAbusesDrugsList, hasFamilyMemberSevereIllness, hasFamilyMemberSevereIllnessList, healthyConditionId, typeOfDeficiency, hasHealthyNeeds, whoIsResponsibleForHelp, pregnancyMonths, hasPreNatal, familyCompositionID } = req.body;

        if (!healthyConditionId) throw new CustomError('Bad Request', 400, 'Bad Request', 'Id is required');

        // Mapping lists (simplify this if possible later)
        const mapList = (list: any[]) => list.map(item => new HealthyConditionStruct(item['name'], item['complement'] || ""));
        
        const healthyCondition = new HealthyCondition(
            hasFamilyMemberNeedsConstantCare, 
            mapList(hasFamilyMemberNeedsConstantCareList), 
            hasFamilyMemberHasAlimentarInsecure, 
            hasFamilyMemberSevereIllness, 
            mapList(hasFamilyMemberSevereIllnessList), 
            hasFamilyMemberUsesControlledMedication, 
            mapList(hasFamilyMemberUsesControlledMedicationList), 
            hasFamilyMemberAbusesAlcohol, 
            mapList(hasFamilyMemberAbusesAlcoholList), 
            hasFamilyMemberAbusesDrugs, 
            mapList(hasFamilyMemberAbusesDrugsList), 
            new Date(), new Date()
        );

        const familyHealth = new HealthyConditionFamily(typeOfDeficiency, hasHealthyNeeds, whoIsResponsibleForHelp);
        const pregnant = new Pregnant(pregnancyMonths, hasPreNatal, true);

        const result = await controller.createHealthCondition(healthyCondition, healthyConditionId, familyHealth, familyCompositionID, memberId, pregnant);
        return res.status(200).json(result);
    } catch (e: any) {
        res.status(e.statusCode || 500).json(e);
    }
});

// --- EDUCATION ---
/**
 * @swagger
 * /members/{memberId}/education:
 *   put:
 *     summary: Atualiza especificações educacionais
 *     tags: [Education]
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
 *               - familyCompositionID
 *             properties:
 *               literaty: { type: boolean }
 *               schoolShip: { type: number }
 *               isStudying: { type: boolean }
 *               occurentDate: { type: string, format: date }
 *               efect: { type: number }
 *               suspensionSolicitation: { type: boolean }
 *               familyCompositionID: { type: string }
 *     responses:
 *       200: { description: Updated }
 */
router.put('/members/:memberId/education', async (req, res) => {
    try {
        const { memberId } = req.params;
        const { literaty, schoolShip, isStudying, occurentDate, efect, suspensionSolicitation, familyCompositionID } = req.body;
        
        const occurentDateDate = new Date(occurentDate);
        const bolsaFamilia = new OcurruncyBolsaFamilia(occurentDateDate, efect, suspensionSolicitation);
        const education = new EducationConditionPerson(true, literaty, schoolShip, isStudying, bolsaFamilia);

        const result = await controller.createEducationCondition(education, familyCompositionID, memberId);
        return res.status(200).json(result);
    } catch (e: any) {
        res.status(e.statusCode || 500).json(e);
    }
});

export default router;