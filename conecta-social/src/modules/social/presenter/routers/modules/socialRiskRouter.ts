import { Hono } from 'hono';
import { SocialRiskController } from '../../../useCase/controllers/modules/socialRiskController.js';
import { CustomError } from '../../../infra/error/error.js';
import { FamilySituationViolation, FamilySituationViolationStruct, FamilySituationViolationStructOther } from '../../../domain/entity/familySituationViolation.js';
import { Observations } from '../../../domain/entity/observations.js';
import { FamilyHistorySocioEducation } from '../../../domain/entity/familyHistorySocioEducation.js';
import { FamilyHistoryInstitutionalComplet, otherFamilySeparationSituationsStruct } from '../../../domain/entity/familyHistoryInstitutionalComplet.js';
import { FamilyInstitucionalHistory } from '../../../domain/entity/familyInstitucionalHistory.js';

const router = new Hono();
const controller = new SocialRiskController();

// Violence
/**
 * @swagger
 * /create/violence/situation:
 *   post:
 *     summary: Cria registro de situação de violência
 *     tags: [Social Risk]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - violenceId
 *             properties:
 *               violenceId: { type: string }
 *               childLabel: { type: boolean }
 *               childLabelOcurrentNow: { type: boolean }
 *               sexualExploitation: { type: boolean }
 *               sexualExploitationOcurrentNow: { type: boolean }
 *               sexualAbuse: { type: boolean }
 *               sexualAbuseNow: { type: boolean }
 *               physicalAbuse: { type: boolean }
 *               physicalAbuseNow: { type: boolean }
 *               psychologicalAbuse: { type: boolean }
 *               psychologicalAbuseNow: { type: boolean }
 *               elderNeglect: { type: boolean }
 *               elderNeglectNow: { type: boolean }
 *               childNeglect: { type: boolean }
 *               childNeglectNow: { type: boolean }
 *               pcdNeglect: { type: boolean }
 *               pcdNeglectNow: { type: boolean }
 *               homelessSituation: { type: boolean }
 *               homelessSituationNow: { type: boolean }
 *               humanTrafficking: { type: boolean }
 *               humanTraffickingNow: { type: boolean }
 *               violenceWithElderOrPcd: { type: boolean }
 *               violenceWithElderOrPcdNow: { type: boolean }
 *               otherName: { type: string }
 *               otherNow: { type: boolean }
 *               otherBool: { type: boolean }
 *     responses:
 *       201:
 *         description: Situação criada
 */
router.post('/create/violence/situation', async (c) => {
    try {
        const { childLabel, childLabelOcurrentNow, sexualExploitation, sexualExploitationOcurrentNow, sexualAbuse, sexualAbuseNow, physicalAbuse, physicalAbuseNow, psychologicalAbuse, psychologicalAbuseNow, elderNeglect, elderNeglectNow, childNeglect, childNeglectNow, pcdNeglect, pcdNeglectNow, homelessSituation, homelessSituationNow, humanTrafficking, humanTraffickingNow, violenceWithElderOrPcd, violenceWithElderOrPcdNow, otherName, otherNow, otherBool, violenceId } = await c.req.json();

        if (!violenceId) throw new CustomError('Bad Request', 400, 'Bad Request', 'Id is required');

        const violation = new FamilySituationViolation(
            new FamilySituationViolationStruct(childLabel, childLabelOcurrentNow),
            new FamilySituationViolationStruct(sexualExploitation, sexualExploitationOcurrentNow),
            new FamilySituationViolationStruct(sexualAbuse, sexualAbuseNow),
            new FamilySituationViolationStruct(physicalAbuse, physicalAbuseNow),
            new FamilySituationViolationStruct(psychologicalAbuse, psychologicalAbuseNow),
            new FamilySituationViolationStruct(elderNeglect, elderNeglectNow),
            new FamilySituationViolationStruct(childNeglect, childNeglectNow),
            new FamilySituationViolationStruct(pcdNeglect, pcdNeglectNow),
            new FamilySituationViolationStruct(homelessSituation, homelessSituationNow),
            new FamilySituationViolationStruct(humanTrafficking, humanTraffickingNow),
            new FamilySituationViolationStruct(violenceWithElderOrPcd, violenceWithElderOrPcdNow),
            new FamilySituationViolationStructOther(otherBool, otherNow, otherName),
            true
        );

        const result = await controller.createViolenceSituation(violation, violenceId);
        return c.json(result, 201);
    } catch (e: any) {
        return c.json(e, e.statusCode || 500);
    }
});

/**
 * @swagger
 * /create/violence/situation/observation:
 *   post:
 *     summary: Adiciona observação sobre violência
 *     tags: [Social Risk]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - familySituationViolationId
 *               - observationText
 *               - whoIsObservingId
 *             properties:
 *               familySituationViolationId: { type: string }
 *               observationText: { type: string }
 *               whoIsObservingId: { type: string }
 *     responses:
 *       201:
 *         description: Observação adicionada
 */
router.post('/create/violence/situation/observation', async (c) => {
    try {
        const { familySituationViolationId, observationText, whoIsObservingId } = await c.req.json();
        const newObs = new Observations(observationText, whoIsObservingId);
        const result = await controller.addViolenceObservation(familySituationViolationId, newObs);
        return c.json(result, 201);
    } catch (e: any) {
        return c.json(e, e.statusCode || 500);
    }
});

// Socio-Educational Measures
/**
 * @swagger
 * /create/history/socio/educational/measures:
 *   post:
 *     summary: Cria histórico de medidas socioeducativas
 *     tags: [Social Risk]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               laOrPSCInfomation: { type: boolean }
 *               dateInitJson: { type: string, format: date }
 *               dateOfFinishJson: { type: string, format: date }
 *               numberOfProcess: { type: string }
 *               type: { type: number }
 *               createFamilyHistoryOfComplianseSocioEducationalMensureId: { type: string }
 *               familyCompositionId: { type: string }
 *               personId: { type: string }
 *               anotationsOfPersons: { type: string }
 *     responses:
 *       201:
 *         description: Histórico criado
 */
router.post('/create/history/socio/educational/measures', async (c) => {
    try {
        const { laOrPSCInfomation, dateInitJson, dateOfFinishJson, numberOfProcess, type, createFamilyHistoryOfComplianseSocioEducationalMensureId, familyCompositionId, personId, anotationsOfPersons } = await c.req.json();

        const history = new FamilyHistorySocioEducation(
            new Date(dateInitJson), new Date(dateOfFinishJson), numberOfProcess, type, true
        );

        const result = await controller.createSocioEducational(
            laOrPSCInfomation, createFamilyHistoryOfComplianseSocioEducationalMensureId, history, familyCompositionId, personId, anotationsOfPersons
        );
        return c.json(result, 201);
    } catch (e: any) {
        return c.json(e, e.statusCode || 500);
    }
});

/**
 * @swagger
 * /create/history/socio/educational/measures/observations:
 *   post:
 *     summary: Adiciona observação a medidas socioeducativas
 *     tags: [Social Risk]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - familyHistoryOfComplianseSocioEducationalMensureId
 *               - observation
 *               - whoIsObservingId
 *             properties:
 *               familyHistoryOfComplianseSocioEducationalMensureId: { type: string }
 *               observation: { type: string }
 *               whoIsObservingId: { type: string }
 *     responses:
 *       201:
 *         description: Observação adicionada
 */
router.post('/create/history/socio/educational/measures/observations', async (c) => {
    try {
        const { familyHistoryOfComplianseSocioEducationalMensureId, observation, whoIsObservingId } = await c.req.json();
        const newObs = new Observations(observation, whoIsObservingId);
        const result = await controller.addSocioEducationalObservation(familyHistoryOfComplianseSocioEducationalMensureId, newObs);
        return c.json(result, 201);
    } catch (e: any) {
        return c.json(e, e.statusCode || 500);
    }
});

// Institutional History
/**
 * @swagger
 * /create/family/history/institutional:
 *   post:
 *     summary: Cria histórico institucional familiar
 *     tags: [Social Risk]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               familyInstitutionalShelterHistory: { type: string }
 *               childCustodyHistory: { type: string }
 *               hasMemberInPrision: { type: boolean }
 *               hasMemberInadolescentInSocioEducationalInternment: { type: boolean }
 *               familyHistoryInstitutionalCompletId: { type: string }
 *               dateInitJson: { type: string, format: date }
 *               dateFinishJson: { type: string, format: date }
 *               reason: { type: string }
 *               familyCompositionId: { type: string }
 *               personId: { type: string }
 *     responses:
 *       201:
 *         description: Histórico criado
 */
router.post('/create/family/history/institutional', async (c) => {
    try {
        const { familyInstitutionalShelterHistory, childCustodyHistory, hasMemberInPrision, hasMemberInadolescentInSocioEducationalInternment, familyHistoryInstitutionalCompletId, dateInitJson, dateFinishJson, reason, familyCompositionId, personId } = await c.req.json();

        const other = new otherFamilySeparationSituationsStruct(hasMemberInPrision, hasMemberInadolescentInSocioEducationalInternment);
        const complet = new FamilyHistoryInstitutionalComplet(familyInstitutionalShelterHistory, childCustodyHistory, other, true);
        const personHistory = new FamilyInstitucionalHistory(new Date(dateInitJson), new Date(dateFinishJson), reason, true);

        const result = await controller.createInstitutionalHistory(complet, familyHistoryInstitutionalCompletId, personHistory, familyCompositionId, personId);
        return c.json(result, 201);
    } catch (e: any) {
        return c.json(e, e.statusCode || 500);
    }
});

/**
 * @swagger
 * /create/family/history/institutional/observation:
 *   post:
 *     summary: Adiciona observação ao histórico institucional
 *     tags: [Social Risk]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - familyHistoryInstitutionalCompletId
 *               - observation
 *               - whoIsObservingId
 *             properties:
 *               familyHistoryInstitutionalCompletId: { type: string }
 *               observation: { type: string }
 *               whoIsObservingId: { type: string }
 *     responses:
 *       201:
 *         description: Observação adicionada
 */
router.post('/create/family/history/institutional/observation', async (c) => {
    try {
        const { familyHistoryInstitutionalCompletId, observation, whoIsObservingId } = await c.req.json();
        const newObs = new Observations(observation, whoIsObservingId);
        const result = await controller.addInstitutionalObservation(familyHistoryInstitutionalCompletId, newObs);
        return c.json(result, 201);
    } catch (e: any) {
        return c.json(e, e.statusCode || 500);
    }
});

export default router;
