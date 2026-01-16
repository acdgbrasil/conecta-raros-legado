import {Router} from 'express';
import {UserController} from '../../useCase/controllers/userController.js';
import { User, UserRole } from '../../domain/entity/user.js';
import { CustomError } from '../../infra/error/error.js';
import { ReferencePerson } from '../../domain/entity/referencePerson.js';
import { Observations } from '../../domain/entity/observations.js';
import { FirstEntryInUnity } from '../../domain/entity/firstEntryInUnity.js';
import { Documents, EducationConditionPerson, FamilyCompositionPerson, OcurruncyBolsaFamilia, Pregnant, WorkConditionPerson } from '../../domain/entity/familyComposition.js';
import { HomeConditions } from '../../domain/entity/homeConditions.js';
import { WorkCondition } from '../../domain/entity/workCondition.js';
import { FamilySituationViolation, FamilySituationViolationStruct, FamilySituationViolationStructOther } from '../../domain/entity/familySituationViolation.js';
import { HelphyCondition, HelphyConditionStruct } from '../../domain/entity/healthCondition.js';
import { HelphyConditionFamily } from '../../domain/entity/familyHelphyCondition.js';
import { FamilyEventlyBenefits } from '../../domain/entity/familyEnvetlyBenefits.js';
import { FamilyAndCommunity } from '../../domain/entity/familyAndCommunity.js';
import { FamilyComunitaryConvivation } from '../../domain/entity/familyComunitaryConvivation.js';
import { FamilyHistorySocioEducation } from '../../domain/entity/familyHistorySocioEducation.js';
import { FamilyHistoryInstitutionalComplet, otherFamilySeparationSituationsStruct } from '../../domain/entity/familyHistoryInstitutionalComplet.js';
import { FamilyInstitucionalHistory } from '../../domain/entity/familyInstitucionalHistory.js';
import { converterDataStringParaIsoUtc } from '../../utils/dateFormater.js';

const userRouter = Router();
const userControle = new UserController();

userRouter.post('/create/family/history/institutional/observation',async (req,res)=>{
    try{
        const {familyHistoryInstitutionalCompletId,observation,whoIsObservingId} = req.body;
        if(!familyHistoryInstitutionalCompletId){
            const error = new CustomError('Bad Request',400,'Bad Request','Family History Institutional Complet Id is required');
            return res.status(400).json(error.toJson('Family History Institutional Complet Id is required'));
        }
        if(!observation){
            const error = new CustomError('Bad Request',400,'Bad Request','Observation is required');
            return res.status(400).json(error.toJson('Observation is required'));
        }
        if(!whoIsObservingId){
            const error = new CustomError('Bad Request',400,'Bad Request','Who Is Observing Id is required');
            return res.status(400).json(error.toJson('Who Is Observing Id is required'));
        }
        const observationSchema = new Observations(observation,whoIsObservingId);
        const observationCreated = await userControle.createFamilyHistoryInstitutionalCompletObservation(familyHistoryInstitutionalCompletId,observationSchema);
        return res.status(201).json(observationCreated);
    }catch(e){
        if(e instanceof CustomError){
            res.status(e.statusCode).json(e.toJson(e.message));
        }else{
            res.status(500).json({error:'Internal server error'});
        }
    }
})

userRouter.post('/create/family/history/institutional', async (req,res)=>{
    try{
        const {familyInstitutionalShelterHistory,childCustodyHistory,hasMemberInPrision,hasMemberInadolescentInSocioEducationalInternment,familyHistoryInstitutionalCompletId,dateInitJson,dateFinishJson,reason,familyCompositionId,personId} = req.body;
        
        if(!familyInstitutionalShelterHistory){
            const error = new CustomError('Bad Request',400,'Bad Request','Family Institutional Shelter History is required');
            return res.status(400).json(error.toJson('Family Institutional Shelter History is required'));
        }

        if(!childCustodyHistory){
            const error = new CustomError('Bad Request',400,'Bad Request','Child Custody History is required');
            return res.status(400).json(error.toJson('Child Custody History is required'));
        }

        if(!(typeof hasMemberInPrision == "boolean") || hasMemberInPrision == null){
            const error = new CustomError('Bad Request',400,'Bad Request','Has Member In Prision is required');
            return res.status(400).json(error.toJson('Has Member In Prision is required'));
        }

        if(!(typeof hasMemberInadolescentInSocioEducationalInternment == "boolean") || hasMemberInadolescentInSocioEducationalInternment == null){
            const error = new CustomError('Bad Request',400,'Bad Request','Has Member In Adolescent In Socio Educational Internment is required');
            return res.status(400).json(error.toJson('Has Member In Adolescent In Socio Educational Internment is required'));
        }

        if(!familyHistoryInstitutionalCompletId){
            const error = new CustomError('Bad Request',400,'Bad Request','Family History Institutional Complet Id is required');
            return res.status(400).json(error.toJson('Family History Institutional Complet Id is required'));
        }

        if(!dateInitJson){
            const error = new CustomError('Bad Request',400,'Bad Request','Date Init is required');
            return res.status(400).json(error.toJson('Date Init is required'));
        }

        if(!dateFinishJson){
            const error = new CustomError('Bad Request',400,'Bad Request','Date Finish is required');
            return res.status(400).json(error.toJson('Date Finish is required'));
        }

        if(!reason){
            const error = new CustomError('Bad Request',400,'Bad Request','Reason is required');
            return res.status(400).json(error.toJson('Reason is required'));
        }

        if(!familyCompositionId){
            const error = new CustomError('Bad Request',400,'Bad Request','Family Composition Id is required');
            return res.status(400).json(error.toJson('Family Composition Id is required'));
        }

        if(!personId){
            const error = new CustomError('Bad Request',400,'Bad Request','Person Id is required');
            return res.status(400).json(error.toJson('Person Id is required'));
        }

        const dateInit = new Date(dateInitJson);
        const dateFinish = new Date(dateFinishJson);

        const otherFamilySeparationSituations = new otherFamilySeparationSituationsStruct(hasMemberInPrision,hasMemberInadolescentInSocioEducationalInternment)
        const familyHistoryInstitutionalComplet = new FamilyHistoryInstitutionalComplet(familyInstitutionalShelterHistory,childCustodyHistory,otherFamilySeparationSituations,true)
        const familyInstitucionalHistoryPerson = new FamilyInstitucionalHistory(dateInit,dateFinish,reason,true)
        

        const result = await userControle.createFamilyHistoryInstitutionalComplets(familyHistoryInstitutionalComplet,familyHistoryInstitutionalCompletId,familyInstitucionalHistoryPerson,familyCompositionId,personId);
        return res.status(201).json(result);

    }catch(e){
        if(e instanceof CustomError){
            res.status(e.statusCode).json(e.toJson(e.message));
        }else{
            res.status(500).json({error:'Internal server error'});
        }
    }
})

userRouter.post('/create/history/socio/educational/measures/observations',async (req,res)=>{
    try{
        const {familyHistoryOfComplianseSocioEducationalMensureId,observation,whoIsObservingId} = req.body;
        if(!familyHistoryOfComplianseSocioEducationalMensureId){
            const error = new CustomError('Bad Request',400,'Bad Request','Family History Of Compliance Socio Educational Mensure Id is required');
            return res.status(400).json(error.toJson('Family History Of Compliance Socio Educational Mensure Id is required'));
        }
        if(!observation){
            const error = new CustomError('Bad Request',400,'Bad Request','Observation is required');
            return res.status(400).json(error.toJson('Observation is required'));
        }
        if(!whoIsObservingId){
            const error = new CustomError('Bad Request',400,'Bad Request','Who Is Observing Id is required');
            return res.status(400).json(error.toJson('Who Is Observing Id is required'));
        }
        const observationSchema = new Observations(observation,whoIsObservingId);
        const observationCreated = await userControle.createFamilyHistoryOfComplianseSocioEducationalMensureObservation(familyHistoryOfComplianseSocioEducationalMensureId,observationSchema);
        return res.status(201).json(observationCreated);
    }catch(e){
        if(e instanceof CustomError){
            res.status(e.statusCode).json(e.toJson(e.message));
        }else{
            res.status(500).json({error:'Internal server error'});
        }
    }
})

userRouter.post('/create/history/socio/educational/measures',async (req,res)=>{
    try{
        const {laOrPSCInfomation,dateInitJson,dateOfFinishJson,numberOfProcess,type,createFamilyHistoryOfComplianseSocioEducationalMensureId,familyCompositionId,personId,anotationsOfPersons} = req.body;

        if(!typeof(laOrPSCInfomation == "boolean") || laOrPSCInfomation == null){
            const error = new CustomError('Bad Request',400,'Bad Request','La Or PSC Infomation is required');
            return res.status(400).json(error.toJson('La Or PSC Infomation is required'));
        }

        if(!dateInitJson){
            const error = new CustomError('Bad Request',400,'Bad Request','Date Init is required');
            return res.status(400).json(error.toJson('Date Init is required'));
        }

        if(!dateOfFinishJson){
            const error = new CustomError('Bad Request',400,'Bad Request','Date Of Finish is required');
            return res.status(400).json(error.toJson('Date Of Finish is required'));
        }

        if(!numberOfProcess){
            const error = new CustomError('Bad Request',400,'Bad Request','Number Of Process is required');
            return res.status(400).json(error.toJson('Number Of Process is required'));
        }

        if(!type){
            const error = new CustomError('Bad Request',400,'Bad Request','Type is required');
            return res.status(400).json(error.toJson('Type is required'));
        }

        if(!createFamilyHistoryOfComplianseSocioEducationalMensureId){
            const error = new CustomError('Bad Request',400,'Bad Request','Create Family History Of Complianse Socio Educational Mensure Id is required');
            return res.status(400).json(error.toJson('Create Family History Of Complianse Socio Educational Mensure Id is required'));
        }

        if(!familyCompositionId){
            const error = new CustomError('Bad Request',400,'Bad Request','Family Composition Id is required');
            return res.status(400).json(error.toJson('Family Composition Id is required'));
        }

        if(!personId){
            const error = new CustomError('Bad Request',400,'Bad Request','Person Id is required');
            return res.status(400).json(error.toJson('Person Id is required'));
        }

        if(!anotationsOfPersons){
            const error = new CustomError('Bad Request',400,'Bad Request','Anotations Of Persons is required');
            return res.status(400).json(error.toJson('Anotations Of Persons is required'));
        }

        
        const dateInit = new Date(dateInitJson);
        const dateOfFinish = new Date(dateOfFinishJson);

        const familyHistorySocioEducation = new FamilyHistorySocioEducation(dateInit,dateOfFinish,numberOfProcess,type,true);
     
        const familyHistoryOfComplianceSocioEducationalMeasuresCreated = await userControle.createFamilyHistoryOfComplianseSocioEducationalMensure(laOrPSCInfomation,createFamilyHistoryOfComplianseSocioEducationalMensureId,familyHistorySocioEducation,familyCompositionId,personId,anotationsOfPersons);
        
        return res.status(201).json(familyHistoryOfComplianceSocioEducationalMeasuresCreated);
    }catch(e){
        if(e instanceof CustomError){
            res.status(e.statusCode).json(e.toJson(e.message));
        }else{
            console.log(e);
            res.status(500).json({error:'Internal server error'});
        }
    }
})

userRouter.post('/create/family/comunitary/convivation/person',async (req,res)=>{
    try{
        const {dateOfInitJson,dateOfFinishJson,unity,serviceType,familyCompositionID,personId} = req.body;
        
        if(!dateOfInitJson){
            const error = new CustomError('Bad Request',400,'Bad Request','Date Of Init is required');
            return res.status(400).json(error.toJson('Date Of Init is required'));
        }
        if(!dateOfFinishJson){
            const error = new CustomError('Bad Request',400,'Bad Request','Date Of Finish is required');
            return res.status(400).json(error.toJson('Date Of Finish is required'));
        }
        if(!unity){
            const error = new CustomError('Bad Request',400,'Bad Request','Unity is required');
            return res.status(400).json(error.toJson('Unity is required'));
        }
        if(!serviceType){
            const error = new CustomError('Bad Request',400,'Bad Request','Service Type is required');
            return res.status(400).json(error.toJson('Service Type is required'));
        }
        if(!familyCompositionID){
            const error = new CustomError('Bad Request',400,'Bad Request','Family Composition Id is required');
            return res.status(400).json(error.toJson('Family Composition Id is required'));
        }
        if(!personId){
            const error = new CustomError('Bad Request',400,'Bad Request','Person Id is required');
            return res.status(400).json(error.toJson('Person Id is required'));
        }

        
        const dateOfInit = new Date(dateOfInitJson);
        const dateOfFinish = new Date(dateOfFinishJson);
        const familyComunitaryConvivation = new FamilyComunitaryConvivation(dateOfInit,dateOfFinish,unity,serviceType);
        const createFamilyComunitaryConvivationPerson = await userControle.createFamilyComunitaryConvivationPerson(familyComunitaryConvivation,familyCompositionID,personId);
        return res.status(201).json(createFamilyComunitaryConvivationPerson);
    }catch(e){
        if(e instanceof CustomError){
            res.status(e.statusCode).json(e.toJson(e.message));
        }else{
            res.status(500).json({error:'Internal server error'});
        }
    }
})

userRouter.post('/create/family/community/observation',async (req,res)=>{
    try{
        const {observation,whoIsObservingId,familyAndCommunityId} = req.body;
        if(!observation){
            const error = new CustomError('Bad Request',400,'Bad Request','Observation is required');
            return res.status(400).json(error.toJson('Observation is required'));
        }
        if(!whoIsObservingId){
            const error = new CustomError('Bad Request',400,'Bad Request','Who Is Observing Id is required');
            return res.status(400).json(error.toJson('Who Is Observing Id is required'));
        }
        if(!familyAndCommunityId){
            const error = new CustomError('Bad Request',400,'Bad Request','Family And Community Id is required');
            return res.status(400).json(error.toJson('Family And Community Id is required'));
        }
        const observationSchema = new Observations(observation,whoIsObservingId);
        const observationCreated = await userControle.createFamilyAndCommunityObservation(familyAndCommunityId,observationSchema);
        return res.status(201).json(observationCreated);

    }catch(e){
        if(e instanceof CustomError){
            res.status(e.statusCode).json(e.toJson(e.message));
        }else{
            res.status(500).json({error:'Internal server error'});
        }
    }
})

userRouter.post('/create/family/community',async (req,res)=>{
    try{
      const {
        yearsInState,
        awaysLivingInState,
        yearsInDistrict,
        awaysLivingInDistrict,
        yearsInNeighborhood,
        awaysLivingInNeighborhood,
        hasVictimOfThreatsOrDiscrimination,
        hasNearbySupportNetwork,
        hasNeighborSupportNetwork,
        hasParticipatesInSupportGroups,
        hasParticipatesInSocialMovements,
        hasNoAccessToLeisureActivities,
        hasElderWithoutLeisureOrSocialInteraction,
        hasDependentsLeftAloneAtHome,
        relationshipEvaluationByTechnician,
        parentChildRelationshipEvaluation,
        siblingRelationshipEvaluation,
        conflictWithOtherResidents,
        familyAndCommunityId
      } = req.body;

        if(!yearsInState){
            const error = new CustomError('Bad Request',400,'Bad Request','Years In State is required');
            return res.status(400).json(error.toJson('Years In State is required'));
        }

        if(!(typeof awaysLivingInState == "boolean") || awaysLivingInState == null){
            const error = new CustomError('Bad Request',400,'Bad Request','Aways Living In State is required');
            return res.status(400).json(error.toJson('Aways Living In State is required'));
        }

        if(!yearsInDistrict){
            const error = new CustomError('Bad Request',400,'Bad Request','Years In District is required');
            return res.status(400).json(error.toJson('Years In District is required'));
        }

        if(!(typeof awaysLivingInDistrict == "boolean") || awaysLivingInDistrict == null){
            const error = new CustomError('Bad Request',400,'Bad Request','Aways Living In District is required');
            return res.status(400).json(error.toJson('Aways Living In District is required'));
        }

        if(!yearsInNeighborhood){
            const error = new CustomError('Bad Request',400,'Bad Request','Years In Neighborhood is required');
            return res.status(400).json(error.toJson('Years In Neighborhood is required'));
        }

        if(!(typeof awaysLivingInNeighborhood == "boolean") || awaysLivingInNeighborhood == null){
            const error = new CustomError('Bad Request',400,'Bad Request','Aways Living In Neighborhood is required');
            return res.status(400).json(error.toJson('Aways Living In Neighborhood is required'));
        }

        if(!(typeof hasVictimOfThreatsOrDiscrimination == "boolean") || hasVictimOfThreatsOrDiscrimination == null){
            const error = new CustomError('Bad Request',400,'Bad Request','Has Victim Of Threats Or Discrimination is required');
            return res.status(400).json(error.toJson('Has Victim Of Threats Or Discrimination is required'));
        }

        if(!(typeof hasNearbySupportNetwork == "boolean") || hasNearbySupportNetwork == null){
            const error = new CustomError('Bad Request',400,'Bad Request','Has Nearby Support Network is required');
            return res.status(400).json(error.toJson('Has Nearby Support Network is required'));
        }

        if(!(typeof hasNeighborSupportNetwork == "boolean") || hasNeighborSupportNetwork == null){
            const error = new CustomError('Bad Request',400,'Bad Request','Has Neighbor Support Network is required');
            return res.status(400).json(error.toJson('Has Neighbor Support Network is required'));
        }

        if(!(typeof hasParticipatesInSupportGroups == "boolean") || hasParticipatesInSupportGroups == null){
            const error = new CustomError('Bad Request',400,'Bad Request','Has Participates In Support Groups is required');
            return res.status(400).json(error.toJson('Has Participates In Support Groups is required'));
        }

        if(!(typeof hasParticipatesInSocialMovements == "boolean") || hasParticipatesInSocialMovements == null){
            const error = new CustomError('Bad Request',400,'Bad Request','Has Participates In Social Movements is required');
            return res.status(400).json(error.toJson('Has Participates In Social Movements is required'));
        }

        if(!(typeof hasNoAccessToLeisureActivities == "boolean") || hasNoAccessToLeisureActivities == null){
            const error = new CustomError('Bad Request',400,'Bad Request','Has No Access To Leisure Activities is required');
            return res.status(400).json(error.toJson('Has No Access To Leisure Activities is required'));
        }

        if(!(typeof hasElderWithoutLeisureOrSocialInteraction == "boolean") || hasElderWithoutLeisureOrSocialInteraction == null){
            const error = new CustomError('Bad Request',400,'Bad Request','Has Elder Without Leisure Or Social Interaction is required');
            return res.status(400).json(error.toJson('Has Elder Without Leisure Or Social Interaction is required'));
        }

        if(!(typeof hasDependentsLeftAloneAtHome == "boolean") || hasDependentsLeftAloneAtHome == null){
            const error = new CustomError('Bad Request',400,'Bad Request','Has Dependents Left Alone At Home is required');
            return res.status(400).json(error.toJson('Has Dependents Left Alone At Home is required'));
        }

        if(!relationshipEvaluationByTechnician){
            const error = new CustomError('Bad Request',400,'Bad Request','Relationship Evaluation By Technician is required');
            return res.status(400).json(error.toJson('Relationship Evaluation By Technician is required'));
        }

        if(!parentChildRelationshipEvaluation){
            const error = new CustomError('Bad Request',400,'Bad Request','Parent Child Relationship Evaluation is required');
            return res.status(400).json(error.toJson('Parent Child Relationship Evaluation is required'));
        }

        if(!siblingRelationshipEvaluation){
            const error = new CustomError('Bad Request',400,'Bad Request','Sibling Relationship Evaluation is required');
            return res.status(400).json(error.toJson('Sibling Relationship Evaluation is required'));
        }

        if(!conflictWithOtherResidents){
            const error = new CustomError('Bad Request',400,'Bad Request','Conflict With Other Residents is required');
            return res.status(400).json(error.toJson('Conflict With Other Residents is required'));
        }

        if(!familyAndCommunityId){
            const error = new CustomError('Bad Request',400,'Bad Request','Family And Community Id is required');
            return res.status(400).json(error.toJson('Family And Community Id is required'));
        }

        const familyCommunity = new FamilyAndCommunity(yearsInState,awaysLivingInState,yearsInDistrict,awaysLivingInDistrict,yearsInNeighborhood,awaysLivingInNeighborhood,hasVictimOfThreatsOrDiscrimination,hasNearbySupportNetwork,hasNeighborSupportNetwork,hasParticipatesInSupportGroups,hasParticipatesInSocialMovements,hasNoAccessToLeisureActivities,hasElderWithoutLeisureOrSocialInteraction,hasDependentsLeftAloneAtHome,relationshipEvaluationByTechnician,parentChildRelationshipEvaluation,siblingRelationshipEvaluation,conflictWithOtherResidents,true);
        const familyCommunityCreated = await userControle.createFamilyAndCommunity(familyCommunity,familyAndCommunityId);
        return res.status(201).json(familyCommunityCreated);
        
    }catch(e){
        if(e instanceof CustomError){
            res.status(e.statusCode).json(e.toJson(e.message));
        }else{
            res.status(500).json({error:'Internal server error'});
        }
    }
})

userRouter.post('/create/evently/benefits',async (req,res)=>{
    try{
        const { date,typeOfBenefit,nBirthDate,nCpf,familyEventlyBenefitsId } = req.body;

        if(!date){
            const error = new CustomError('Bad Request',400,'Bad Request','Date is required');
            return res.status(400).json(error.toJson('Date is required'));
        }
    
        if(!typeOfBenefit){
            const error = new CustomError('Bad Request',400,'Bad Request','Type Of Benefit is required');
            return res.status(400).json(error.toJson('Type Of Benefit is required'));
        }
    
        if(!nBirthDate){
            const error = new CustomError('Bad Request',400,'Bad Request','Birth Date is required');
            return res.status(400).json(error.toJson('Birth Date is required'));
        }
    
        if(!nCpf){
            const error = new CustomError('Bad Request',400,'Bad Request','Cpf is required');
            return res.status(400).json(error.toJson('Cpf is required'));
        }
    
        if(!familyEventlyBenefitsId){
            const error = new CustomError('Bad Request',400,'Bad Request','Family Evently Benefits Id is required');
            return res.status(400).json(error.toJson('Family Evently Benefits Id is required'));
        }
    
        const dateFormater = new Date(date);
    
        const eventlyBenefit = new FamilyEventlyBenefits(dateFormater,typeOfBenefit,nBirthDate,nCpf,true);
    
        const eventlyBenefitCreated = await userControle.createFamilyEventlyBenefits(eventlyBenefit,familyEventlyBenefitsId);
    
        return res.status(201).json(eventlyBenefitCreated);
    }catch(e){
        if(e instanceof CustomError){
            res.status(e.statusCode).json(e.toJson(e.message));
        }else{
            res.status(500).json({error:'Internal server error'});
        }
    }
})

userRouter.post('/create/health/condition/observation',async (req,res)=>{
    try{
        const {helphyConditionId,bodyObservation,whoIsObservingId} = req.body;
        if(!helphyConditionId){
            const error = new CustomError('Bad Request',400,'Bad Request','Helphy Condition Id is required');
            return res.status(400).json(error.toJson('Helphy Condition Id is required'));
        }
        if(!bodyObservation){
            const error = new CustomError('Bad Request',400,'Bad Request','Observation is required');
            return res.status(400).json(error.toJson('Observation is required'));
        }

        if(!whoIsObservingId){
            const error = new CustomError('Bad Request',400,'Bad Request','Who Is Observing Id is required');
            return res.status(400).json(error.toJson('Who Is Observing Id is required'));
        }

        const observation = new Observations(bodyObservation,whoIsObservingId);

        const observationCreated = await userControle.createHelphyConditionObservation(helphyConditionId,observation);
        return res.status(201).json(observationCreated);

    }catch(e){
        if(e instanceof CustomError){
            res.status(e.statusCode).json(e.toJson(e.message));
        }else{
            res.status(500).json({error:'Internal server error'});
        }
    }
})

userRouter.post('/create/violence/situation/observation',async (req,res)=>{
    try{
        const {familySituationViolationId,observationText,whoIsObservingId} = req.body;
        if(!familySituationViolationId){
            const error = new CustomError('Bad Request',400,'Bad Request','Family Situation Violation Id is required');
            return res.status(400).json(error.toJson('Family Situation Violation Id is required'));
        }
        if(!observationText){
            const error = new CustomError('Bad Request',400,'Bad Request','Observation is required');
            return res.status(400).json(error.toJson('Observation is required'));
        }
        if(!whoIsObservingId){
            const error = new CustomError('Bad Request',400,'Bad Request','Who Is Observing Id is required');
            return res.status(400).json(error.toJson('Who Is Observing Id is required'));
        }

        const observation = new Observations(observationText,whoIsObservingId);
        
        const familySituationViolationObservation = await userControle.createSituationViolationObservation(familySituationViolationId,observation);
        return res.status(201).json(familySituationViolationObservation);
    }catch(e){
        if(e instanceof CustomError){
            res.status(e.statusCode).json(e.toJson(e.message));
        }else{
            console.log(e);
            res.status(500).json({error:'Internal server error'});
        }
    }
})

userRouter.post('/create/health/condition/observation',async (req,res)=>{
    try{
        const {helphyConditionId,observation,whoIsObservingId} = req.body;
        if(!helphyConditionId){
            const error = new CustomError('Bad Request',400,'Bad Request','Helphy Condition Id is required');
            return res.status(400).json(error.toJson('Helphy Condition Id is required'));
        }
        if(!observation){
            const error = new CustomError('Bad Request',400,'Bad Request','Observation is required');
            return res.status(400).json(error.toJson('Observation is required'));
        }
        if(!whoIsObservingId){
            const error = new CustomError('Bad Request',400,'Bad Request','Who Is Observing Id is required');
            return res.status(400).json(error.toJson('Who Is Observing Id is required'));
        }
        const observationSchema = new Observations(observation,whoIsObservingId);
        const observationCreated = await userControle.createHelphyConditionObservation(helphyConditionId,observationSchema);
        return res.status(201).json(observationCreated);

    }catch(e){
        if(e instanceof CustomError){
            res.status(e.statusCode).json(e.toJson(e.message));
        }else{
            res.status(500).json({error:'Internal server error'});
        }
    }
})

userRouter.post('/create/health/condition',async (req,res)=>{

    try{
        const {hasFamilyMemberNeedsConstantCare,hasFamilyMemberNeedsConstantCareList,hasFamilyMemberHasAlimentarInsecure,hasFamilyMemberUsesControlledMedication,hasFamilyMemberUsesControlledMedicationList,hasFamilyMemberAbusesAlcohol,hasFamilyMemberAbusesAlcoholList,hasFamilyMemberAbusesDrugs,hasFamilyMemberAbusesDrugsList,hasFamilyMemberSevereIllness,hasFamilyMemberSevereIllnessList,helphyConditionId,typeOfDeficiency,hasHelphyNeeds,whoIsResponsibleForHelp,pregnancyMonths,hasPreNatal,familyCompositionID,personId} = req.body;

        if(!(typeof hasFamilyMemberNeedsConstantCare == "boolean") || hasFamilyMemberNeedsConstantCare == null){
            const error = new CustomError('Bad Request',400,'Bad Request','Has Family Member Needs Constant Care is required');
            return res.status(400).json(error.toJson('Has Family Member Needs Constant Care is required'));
        }

        if(!hasFamilyMemberNeedsConstantCareList){
            const error = new CustomError('Bad Request',400,'Bad Request','Has Family Member Needs Constant Care List is required');
            return res.status(400).json(error.toJson('Has Family Member Needs Constant Care List is required'));
        }

        if(!(typeof hasFamilyMemberHasAlimentarInsecure == "boolean") || hasFamilyMemberHasAlimentarInsecure == null){
            const error = new CustomError('Bad Request',400,'Bad Request','Has Family Member Has Alimentar Insecure is required');
            return res.status(400).json(error.toJson('Has Family Member Has Alimentar Insecure is required'));
        }

        if(!(typeof hasFamilyMemberUsesControlledMedication == "boolean") || hasFamilyMemberUsesControlledMedication == null){
            const error = new CustomError('Bad Request',400,'Bad Request','Has Family Member Uses Controlled Medication is required');
            return res.status(400).json(error.toJson('Has Family Member Uses Controlled Medication is required'));
        }

        if(!hasFamilyMemberUsesControlledMedicationList){
            const error = new CustomError('Bad Request',400,'Bad Request','Has Family Member Uses Controlled Medication List is required');
            return res.status(400).json(error.toJson('Has Family Member Uses Controlled Medication List is required'));
        }

        if(!(typeof hasFamilyMemberAbusesAlcohol == "boolean") || hasFamilyMemberAbusesAlcohol == null){
            const error = new CustomError('Bad Request',400,'Bad Request','Has Family Member Abuses Alcohol is required');
            return res.status(400).json(error.toJson('Has Family Member Abuses Alcohol is required'));
        }

        if(!hasFamilyMemberAbusesAlcoholList){
            const error = new CustomError('Bad Request',400,'Bad Request','Has Family Member Abuses Alcohol List is required');
            return res.status(400).json(error.toJson('Has Family Member Abuses Alcohol List is required'));
        }

        if(!(typeof hasFamilyMemberAbusesDrugs == "boolean") || hasFamilyMemberAbusesDrugs == null){
            const error = new CustomError('Bad Request',400,'Bad Request','Has Family Member Abuses Drugs is required');
            return res.status(400).json(error.toJson('Has Family Member Abuses Drugs is required'));
        }

        if(!hasFamilyMemberAbusesDrugsList){
            const error = new CustomError('Bad Request',400,'Bad Request','Has Family Member Abuses Drugs List is required');
            return res.status(400).json(error.toJson('Has Family Member Abuses Drugs List is required'));
        }

        if(!(typeof hasFamilyMemberSevereIllness == "boolean") || hasFamilyMemberSevereIllness == null){
            const error = new CustomError('Bad Request',400,'Bad Request','Has Family Member Severe Illness is required');
            return res.status(400).json(error.toJson('Has Family Member Severe Illness is required'));
        }

        if(!hasFamilyMemberSevereIllnessList){
            const error = new CustomError('Bad Request',400,'Bad Request','Has Family Member Severe Illness List is required');
            return res.status(400).json(error.toJson('Has Family Member Severe Illness List is required'));
        }

        if(!helphyConditionId){
            const error = new CustomError('Bad Request',400,'Bad Request','Helphy Condition Id is required');
            return res.status(400).json(error.toJson('Helphy Condition Id is required'));
        }

        if(!typeOfDeficiency){
            const error = new CustomError('Bad Request',400,'Bad Request','Type Of Deficiency is required');
            return res.status(400).json(error.toJson('Type Of Deficiency is required'));
        }

        if(!(typeof hasHelphyNeeds == "boolean") || hasHelphyNeeds == null){
            const error = new CustomError('Bad Request',400,'Bad Request','Has Helphy Needs is required');
            return res.status(400).json(error.toJson('Has Helphy Needs is required'));
        }

        if(!whoIsResponsibleForHelp){
            const error = new CustomError('Bad Request',400,'Bad Request','Who Is Responsible For Help is required');
            return res.status(400).json(error.toJson('Who Is Responsible For Help is required'));
        }

        if(pregnancyMonths === null || pregnancyMonths === undefined || pregnancyMonths === ''){
            const error = new CustomError('Bad Request',400,'Bad Request','Pregnancy Months is required');
            return res.status(400).json(error.toJson('Pregnancy Months is required'));
        }

        if(!(typeof hasPreNatal == "boolean") || hasPreNatal == null){
            const error = new CustomError('Bad Request',400,'Bad Request','Has Pre Natal is required');
            return res.status(400).json(error.toJson('Has Pre Natal is required'));
        }

        if(!familyCompositionID){
            const error = new CustomError('Bad Request',400,'Bad Request','Family Composition Id is required');
            return res.status(400).json(error.toJson('Family Composition Id is required'));
        }

        if(!personId){
            const error = new CustomError('Bad Request',400,'Bad Request','Person Id is required');
            return res.status(400).json(error.toJson('Person Id is required'));
        }


        const hasFamilyMemberAbusesAlcoholListStruct:HelphyConditionStruct[] = [];
        const hasFamilyMemberUsesControlledMedicationListStruct:HelphyConditionStruct[] = [];        
        const hasFamilyMemberNeedsConstantCareListStruct:HelphyConditionStruct[] = [];
        const hasFamilyMemberAbusesDrugsListStruct:HelphyConditionStruct[] = [];    
        const hasFamilyMemberSevereIllnessListStruct:HelphyConditionStruct[] = [];

        for(let familyMemberneedsConstantCarePerson of hasFamilyMemberNeedsConstantCareList){
           const HelphyConditionStructM =  new HelphyConditionStruct(familyMemberneedsConstantCarePerson['name'],familyMemberneedsConstantCarePerson['complement']);
           hasFamilyMemberNeedsConstantCareListStruct.push(HelphyConditionStructM);
        }

        for(let familyMemberUsesControlledMedicationPerson of hasFamilyMemberUsesControlledMedicationList){
            const HelphyConditionStructM =  new HelphyConditionStruct(familyMemberUsesControlledMedicationPerson['name'],"");
            hasFamilyMemberUsesControlledMedicationListStruct.push(HelphyConditionStructM);
        }

        for(let familyMemberAbusesAlcoholPerson of hasFamilyMemberAbusesAlcoholList){
            const HelphyConditionStructM =  new HelphyConditionStruct(familyMemberAbusesAlcoholPerson['name'],"");
            hasFamilyMemberAbusesAlcoholListStruct.push(HelphyConditionStructM);
        }

        for(let familyMemberAbusesDrugsPerson of hasFamilyMemberAbusesDrugsList){
            const HelphyConditionStructM =  new HelphyConditionStruct(familyMemberAbusesDrugsPerson['name'],familyMemberAbusesDrugsPerson['complement']);
            hasFamilyMemberAbusesDrugsListStruct.push(HelphyConditionStructM);
        }

        for(let familyMemberSevereIllnessPerson of hasFamilyMemberSevereIllnessList){
            const HelphyConditionStructM =  new HelphyConditionStruct(familyMemberSevereIllnessPerson['name'],"");
            hasFamilyMemberSevereIllnessListStruct.push(HelphyConditionStructM);
        }

        const helphyCondition = new HelphyCondition(hasFamilyMemberNeedsConstantCare,hasFamilyMemberNeedsConstantCareListStruct,hasFamilyMemberHasAlimentarInsecure,hasFamilyMemberSevereIllness,hasFamilyMemberSevereIllnessListStruct,hasFamilyMemberUsesControlledMedication,hasFamilyMemberUsesControlledMedicationListStruct,hasFamilyMemberAbusesAlcohol,hasFamilyMemberAbusesAlcoholListStruct,hasFamilyMemberAbusesDrugs,hasFamilyMemberAbusesDrugsListStruct,new Date(),new Date());
        const HelphyConditionFamilyStruct = new HelphyConditionFamily(typeOfDeficiency,hasHelphyNeeds,whoIsResponsibleForHelp);
        const helphyConditionPrengnant = new Pregnant(pregnancyMonths,hasPreNatal,true);

        const helphyConditionCreated = await userControle.createHelphyCondition(helphyCondition,helphyConditionId,HelphyConditionFamilyStruct,familyCompositionID,personId,helphyConditionPrengnant);

        return res.status(201).json(helphyConditionCreated);
    }catch(e){
        if(e instanceof CustomError){
            res.status(e.statusCode).json(e.toJson(e.message));
        }else{
            res.status(500).json({error:'Internal server error'});
        }
    }

})

userRouter.post('/create/work/condition/observation',async (req,res)=>{
    try{
        const {observation,workConditionId} = req.body;
        if(!observation){
            const error = new CustomError('Bad Request',400,'Bad Request','Observation is required');
            return res.status(400).json(error.toJson('Observation is required'));
        }
        if(!workConditionId){
            const error = new CustomError('Bad Request',400,'Bad Request','Work Condition Id is required');
            return res.status(400).json(error.toJson('Work Condition Id is required'));
        }
        const observationCreated = await userControle.createWorkConditionObservation(workConditionId,observation);
        return res.status(201).json(observationCreated);
    }catch(e){
        if(e instanceof CustomError){
            res.status(e.statusCode).json(e.toJson(e.message));
        }else{
            res.status(500).json({error:'Internal server error'});
        }
    }
})

userRouter.get('/list/composition/family/information/litery/:familyCompositionId',async (req,res)=>{
    try{

        const familyCompositionId = req.params['familyCompositionId'];
        
        const informationOfAgeAndFrequencyOfSchool = await userControle.getInformationOfPersonAndAgeAreInSchool(familyCompositionId);
        return res.status(200).json(informationOfAgeAndFrequencyOfSchool);
    }catch(e){
        if(e instanceof CustomError){
            res.status(e.statusCode).json(e.toJson(e.message));
        }else{
            res.status(500).json({error:'Internal server error'});
        }
    }
})

userRouter.get('/list/reference/person/:familyCompositionId',async (req,res)=>{
    try{

        const familyCompositionId = req.params['familyCompositionId'];

        if(!familyCompositionId){
            const error = new CustomError('Bad Request',400,'Bad Request','Family Composition Id is required');
            return res.status(400).json(error.toJson('Family Composition Id is required'));
        }

        const referencePerson = await userControle.getFamilyCompositonPersons(familyCompositionId);
        return res.status(200).json(referencePerson);
    }catch(e){
        if(e instanceof CustomError){
            res.status(e.statusCode).json(e.toJson(e.message));
        }else{
            res.status(500).json({error:'Internal server error'});
        }
    }
})

userRouter.post('/create/educational/especifications',async (req,res)=>{
    try{
        const {literaty,schoolShip,isStudying,occurentDate,efect,suspensionSolicitation,familyCompositionID,personId} = req.body;
        
        if(!(typeof literaty == "boolean") || literaty == null){
            const error = new CustomError('Bad Request',400,'Bad Request','Literaty is required');
            return res.status(400).json(error.toJson('Literaty is required'));
        }

        if(!schoolShip){
            const error = new CustomError('Bad Request',400,'Bad Request','School Ship is required');
            return res.status(400).json(error.toJson('School Ship is required'));
        }

        if(!(typeof isStudying == "boolean") || isStudying == null){
            const error = new CustomError('Bad Request',400,'Bad Request','Is Studying is required');
            return res.status(400).json(error.toJson('Is Studying is required'));
        }

        if(!occurentDate){
            const error = new CustomError('Bad Request',400,'Bad Request','Occurent Date is required');
            return res.status(400).json(error.toJson('Occurent Date is required'));
        }

        if(!efect){
            const error = new CustomError('Bad Request',400,'Bad Request','efect is required');
            return res.status(400).json(error.toJson('Educational Esp is required'));
        }

        if(!(typeof suspensionSolicitation == "boolean") || suspensionSolicitation == null){
            const error = new CustomError('Bad Request',400,'Bad Request','Suspension Solicitation is required');
            return res.status(400).json(error.toJson('Suspension Solicitation is required'));
        }

        if(!familyCompositionID){
            const error = new CustomError('Bad Request',400,'Bad Request','Family Situation Id is required');
            return res.status(400).json(error.toJson('Family Situation Id is required'));
        }
        if(!personId){
            const error = new CustomError('Bad Request',400,'Bad Request','Person Id is required');
            return res.status(400).json(error.toJson('Person Id is required'));
        }

        const occurentDateDate = new Date(occurentDate);

        const bolsaFamiliaEspecification = new OcurruncyBolsaFamilia(occurentDateDate,efect,suspensionSolicitation);
        const educationalEspecifications = new EducationConditionPerson(true,literaty,schoolShip,isStudying,bolsaFamiliaEspecification);


        const familyComposition = await userControle.createEducationalEspecifications(educationalEspecifications,familyCompositionID,personId);
        return res.status(201).json(familyComposition);
    }catch(e){
        if(e instanceof CustomError){
            res.status(e.statusCode).json(e.toJson(e.message));
        }else{
            res.status(500).json({error:'Internal server error'});
        }
    }
})

userRouter.post('/create/violence/situation',async (req,res)=>{
    try{
        const {childLabel,childLabelOcurrentNow,sexualExploitation,sexualExploitationOcurrentNow,sexualAbuse,sexualAbuseNow,physicalAbuse,physicalAbuseNow,psychologicalAbuse,psychologicalAbuseNow,elderNeglect,elderNeglectNow,childNeglect,childNeglectNow,pcdNeglect,pcdNeglectNow,homelessSituation,homelessSituationNow,humanTrafficking,humanTraffickingNow,violenceWithElderOrPcd,violenceWithElderOrPcdNow,otherName,otherNow,otherBool,violenceId} = req.body;
        
        if(!violenceId){
            const error = new CustomError('Bad Request',400,'Bad Request','Violence Id is required');
            return res.status(400).json(error.toJson('Violence Id is required'));
        }
        
        if(!(typeof childLabel == "boolean") || childLabel == null){
            const error = new CustomError('Bad Request',400,'Bad Request','Child Label is required');
            return res.status(400).json(error.toJson('Child Label is required'));
        }

        if(!(typeof childLabelOcurrentNow == "boolean") || childLabelOcurrentNow == null){
            const error = new CustomError('Bad Request',400,'Bad Request','Child Label Ocurrent Now is required');
            return res.status(400).json(error.toJson('Child Label Ocurrent Now is required'));
        }

        if(!(typeof sexualExploitation == "boolean") || sexualExploitation == null){
            const error = new CustomError('Bad Request',400,'Bad Request','Sexual Exploitation is required');
            return res.status(400).json(error.toJson('Sexual Exploitation is required'));
        }

        if(!(typeof sexualExploitationOcurrentNow == "boolean") || sexualExploitationOcurrentNow == null){
            const error = new CustomError('Bad Request',400,'Bad Request','Sexual Exploitation Ocurrent Now is required');
            return res.status(400).json(error.toJson('Sexual Exploitation Ocurrent Now is required'));
        }

        if(!(typeof sexualAbuse == "boolean") || sexualAbuse == null){
            const error = new CustomError('Bad Request',400,'Bad Request','Sexual Abuse is required');
            return res.status(400).json(error.toJson('Sexual Abuse is required'));
        }

        if(!(typeof sexualAbuseNow == "boolean") || sexualAbuseNow == null){
            const error = new CustomError('Bad Request',400,'Bad Request','Sexual Abuse Now is required');
            return res.status(400).json(error.toJson('Sexual Abuse Now is required'));
        }

        if(!(typeof physicalAbuse == "boolean") || physicalAbuse == null){
            const error = new CustomError('Bad Request',400,'Bad Request','Physical Abuse is required');
            return res.status(400).json(error.toJson('Physical Abuse is required'));
        }

        if(!(typeof physicalAbuseNow == "boolean") || physicalAbuseNow == null){
            const error = new CustomError('Bad Request',400,'Bad Request','Physical Abuse Now is required');
            return res.status(400).json(error.toJson('Physical Abuse Now is required'));
        }

        if(!(typeof psychologicalAbuse == "boolean") || psychologicalAbuse == null){
            const error = new CustomError('Bad Request',400,'Bad Request','Psychological Abuse is required');
            return res.status(400).json(error.toJson('Psychological Abuse is required'));
        }

        if(!(typeof psychologicalAbuseNow == "boolean") || psychologicalAbuseNow == null){
            const error = new CustomError('Bad Request',400,'Bad Request','Psychological Abuse Now is required');
            return res.status(400).json(error.toJson('Psychological Abuse Now is required'));
        }

        if(!(typeof elderNeglect == "boolean") || elderNeglect == null){
            const error = new CustomError('Bad Request',400,'Bad Request','Elder Neglect is required');
            return res.status(400).json(error.toJson('Elder Neglect is required'));
        }

        if(!(typeof elderNeglectNow == "boolean") || elderNeglectNow == null){
            const error = new CustomError('Bad Request',400,'Bad Request','Elder Neglect Now is required');
            return res.status(400).json(error.toJson('Elder Neglect Now is required'));
        }

        if(!(typeof childNeglect == "boolean") || childNeglect == null){
            const error = new CustomError('Bad Request',400,'Bad Request','Child Neglect is required');
            return res.status(400).json(error.toJson('Child Neglect is required'));
        }

        if(!(typeof childNeglectNow == "boolean") || childNeglectNow == null){
            const error = new CustomError('Bad Request',400,'Bad Request','Child Neglect Now is required');
            return res.status(400).json(error.toJson('Child Neglect Now is required'));
        }

        if(!(typeof pcdNeglect == "boolean") || pcdNeglect == null){
            const error = new CustomError('Bad Request',400,'Bad Request','Pcd Neglect is required');
            return res.status(400).json(error.toJson('Pcd Neglect is required'));
        }

        if(!(typeof pcdNeglectNow == "boolean") || pcdNeglectNow == null){
            const error = new CustomError('Bad Request',400,'Bad Request','Pcd Neglect Now is required');
            return res.status(400).json(error.toJson('Pcd Neglect Now is required'));
        }


        if(!(typeof homelessSituation == "boolean") || homelessSituation == null){
            const error = new CustomError('Bad Request',400,'Bad Request','Homeless Situation is required');
            return res.status(400).json(error.toJson('Homeless Situation is required'));
        }


        if(!(typeof homelessSituationNow == "boolean") || homelessSituationNow == null){
            const error = new CustomError('Bad Request',400,'Bad Request','Homeless Situation Now is required');
            return res.status(400).json(error.toJson('Homeless Situation Now is required'));
        }

        if(!(typeof humanTrafficking == "boolean") || humanTrafficking == null){
            const error = new CustomError('Bad Request',400,'Bad Request','Human Trafficking is required');
            return res.status(400).json(error.toJson('Human Trafficking is required'));
        }


        if(!(typeof humanTraffickingNow == "boolean") || humanTraffickingNow == null){
            const error = new CustomError('Bad Request',400,'Bad Request','Human Trafficking Now is required');
            return res.status(400).json(error.toJson('Human Trafficking Now is required'));
        }

        if(!(typeof violenceWithElderOrPcd == "boolean") || violenceWithElderOrPcd == null){
            const error = new CustomError('Bad Request',400,'Bad Request','Violence With Elder Or Pcd is required');
            return res.status(400).json(error.toJson('Violence With Elder Or Pcd is required'));
        }

        if(!(typeof violenceWithElderOrPcdNow == "boolean") || violenceWithElderOrPcdNow == null){
            const error = new CustomError('Bad Request',400,'Bad Request','Violence With Elder Or Pcd Now is required');
            return res.status(400).json(error.toJson('Violence With Elder Or Pcd Now is required'));
        }

        if(!(typeof otherName == "string") || otherName == null){
            const error = new CustomError('Bad Request',400,'Bad Request','Other Name is required');
            return res.status(400).json(error.toJson('Other Name is required'));
        }

        if(!(typeof otherNow == "boolean") || otherNow == null){
            const error = new CustomError('Bad Request',400,'Bad Request','Other Now is required');
            return res.status(400).json(error.toJson('Other Now is required'));
        }
        
        if(!(typeof otherBool == "boolean") || otherBool == null){
            const error = new CustomError('Bad Request',400,'Bad Request','Other Bool is required');
            return res.status(400).json(error.toJson('Other Bool is required'));
        }

        const childStruct = new FamilySituationViolationStruct(childLabel,childLabelOcurrentNow);
        const sexualExploitationStruct = new FamilySituationViolationStruct(sexualExploitation,sexualExploitationOcurrentNow);
        const sexualAbuseStruct = new FamilySituationViolationStruct(sexualAbuse,sexualAbuseNow);
        const physicalAbuseStruct = new FamilySituationViolationStruct(physicalAbuse,physicalAbuseNow);
        const psychologicalAbuseStruct = new FamilySituationViolationStruct(psychologicalAbuse,psychologicalAbuseNow);
        const elderNeglectStruct = new FamilySituationViolationStruct(elderNeglect,elderNeglectNow);
        const childNeglectStruct = new FamilySituationViolationStruct(childNeglect,childNeglectNow);
        const pcdNeglectStruct = new FamilySituationViolationStruct(pcdNeglect,pcdNeglectNow);
        const homelessSituationStruct = new FamilySituationViolationStruct(homelessSituation,homelessSituationNow);
        const humanTraffickingStruct = new FamilySituationViolationStruct(humanTrafficking,humanTraffickingNow);
        const violenceWithElderOrPcdStruct = new FamilySituationViolationStruct(violenceWithElderOrPcd,violenceWithElderOrPcdNow);
        const otherStruct = new FamilySituationViolationStructOther(otherBool,otherNow,otherName);
        

        const familySituation = new FamilySituationViolation(
            childStruct,
            sexualExploitationStruct,
            sexualAbuseStruct,
            physicalAbuseStruct,
            psychologicalAbuseStruct,
            elderNeglectStruct,
            childNeglectStruct,
            pcdNeglectStruct,
            homelessSituationStruct,
            humanTraffickingStruct,
            violenceWithElderOrPcdStruct,
            otherStruct,true);

        
        
        const familySituationCreated = await userControle.createSituationViolation(familySituation,violenceId);
        return res.status(201).json(familySituationCreated);
    }catch(e){
        if(e instanceof CustomError){
            res.status(e.statusCode).json(e.toJson(e.message));
        }else{
            console.log(e)
            res.status(500).json({error:'Internal server error'});
        }
    }
})

userRouter.post('/create/work/condition',async (req,res)=>{
    try{
        const {hasSocialIncome,perCapitaIncome,bolsaFamiliaValue,bpcValue,petiValue,othersValue,bcpBenefitPerson,hasRetiredPerson,totalFamilyIncome,totalPerCapitaIncome,workConditionBody,hasWorkCard,workQualification,workValue,familyCompositionID,personId,workConditionId} = req.body;
        const workCondition = new WorkCondition(hasSocialIncome,perCapitaIncome,hasSocialIncome,bolsaFamiliaValue,bpcValue,petiValue,othersValue,bcpBenefitPerson,hasRetiredPerson,totalFamilyIncome,totalPerCapitaIncome)
        const workConditionPerson = new WorkConditionPerson(true,workConditionBody,hasWorkCard,workQualification,workValue)
        const workConditionResult = await userControle.createWorkConditionPerson(workCondition,workConditionPerson,familyCompositionID,personId,workConditionId)
        return res.status(201).json(workConditionResult);
    }catch(e){
        if(e instanceof CustomError){
            res.status(e.statusCode).json(e.toJson(e.message));
        }else{
            res.status(500).json({error:'Internal server error'});
        }
    }
})

userRouter.post('/create/home/conditions/observation',async (req,res)=>{
    try{
        const {observation,whoIsObservingId,homeConditionsId} = req.body;
        if(!observation){
            const error = new CustomError('Bad Request',400,'Bad Request','Observation is required');
            return res.status(400).json(error.toJson('Observation is required'));
        }
        if(!whoIsObservingId){
            const error = new CustomError('Bad Request',400,'Bad Request','Who Is Observing Id is required');
            return res.status(400).json(error.toJson('Who Is Observing Id is required'));
        }
        if(!homeConditionsId){
            const error = new CustomError('Bad Request',400,'Bad Request','Home Conditions Id is required');
            return res.status(400).json(error.toJson('Home Conditions Id is required'));
        }
        const newObservation = new Observations(observation,whoIsObservingId);
        const observationCreated = await userControle.createHomeConditionsObservation(newObservation,homeConditionsId);
        return res.status(201).json(observationCreated);
    }catch(e){
        if(e instanceof CustomError){
            res.status(e.statusCode).json(e.toJson(e.message));
        }else{
            res.status(500).json({error:'Internal server error'});
        }
    }
})

userRouter.post('/create/home/conditions',async (req,res)=>{
    try{
        const {typeResidence,materialOfExternalWalls,hasAcessEnergy,waterSupply,sewageDisposal,garbageCollection,hasWasteCollection,homeConditionIsInRiskArea,difficultyToAccessHome,hasHomeInsurance,hasHomeInsuranceValue,numberOfRooms,numberOfBedrooms,numberOfPeapleInBedrooms,homeConditionsId} = req.body;
        if(typeResidence == "" || typeResidence == null){
            const error = new CustomError('Bad Request',400,'Bad Request','Type Residence is required');
            return res.status(400).json(error.toJson('Type Residence is required'));
        }
        if(materialOfExternalWalls == "" || materialOfExternalWalls == null){
            const error = new CustomError('Bad Request',400,'Bad Request','Material Of External Walls is required');
            return res.status(400).json(error.toJson('Material Of External Walls is required'));
        }
        if(hasAcessEnergy == "" || hasAcessEnergy == null){
            const error = new CustomError('Bad Request',400,'Bad Request','Has Acess Energy is required');
            return res.status(400).json(error.toJson('Has Acess Energy is required'));
        }
        if(waterSupply == "" || waterSupply == null){
            const error = new CustomError('Bad Request',400,'Bad Request','Water Supply is required');
            return res.status(400).json(error.toJson('Water Supply is required'));
        }
        if(sewageDisposal == "" || sewageDisposal == null){
            const error = new CustomError('Bad Request',400,'Bad Request','Sewage Disposal is required');
            return res.status(400).json(error.toJson('Sewage Disposal is required'));
        }
        if(garbageCollection == "" || garbageCollection == null){
            const error = new CustomError('Bad Request',400,'Bad Request','Garbage Collection is required');
            return res.status(400).json(error.toJson('Garbage Collection is required'));
        }
        
        if(!(typeof hasWasteCollection == "boolean") || hasWasteCollection == null){
            const error = new CustomError('Bad Request',400,'Bad Request','Has Waste Collection is required');
            return res.status(400).json(error.toJson('Has Waste Collection is required'));
        }
        if(!(typeof homeConditionIsInRiskArea == "boolean") || homeConditionIsInRiskArea == null){
            const error = new CustomError('Bad Request',400,'Bad Request','Home Condition Is In Risk Area is required');
            return res.status(400).json(error.toJson('Home Condition Is In Risk Area is required'));
        }
        if(!(typeof difficultyToAccessHome == "boolean") || difficultyToAccessHome == null){
            const error = new CustomError('Bad Request',400,'Bad Request','Difficulty To Access Home is required');
            return res.status(400).json(error.toJson('Difficulty To Access Home is required'));
        }
        if(!(typeof hasHomeInsurance == "boolean") || hasHomeInsurance == null){
            const error = new CustomError('Bad Request',400,'Bad Request','Has Home Insurance is required');
            return res.status(400).json(error.toJson('Has Home Insurance is required'));
        }
        if(hasHomeInsuranceValue == "" || hasHomeInsuranceValue == null){
            const error = new CustomError('Bad Request',400,'Bad Request','Has Home Insurance Value is required');
            return res.status(400).json(error.toJson('Has Home Insurance Value is required'));
        }
        if(numberOfRooms == "" || numberOfRooms == null){
            const error = new CustomError('Bad Request',400,'Bad Request','Number Of Rooms is required');
            return res.status(400).json(error.toJson('Number Of Rooms is required'));
        }
        if(numberOfBedrooms == "" || numberOfBedrooms == null){
            const error = new CustomError('Bad Request',400,'Bad Request','Number Of Bedrooms is required');
            return res.status(400).json(error.toJson('Number Of Bedrooms is required'));
        }
        if(numberOfPeapleInBedrooms == "" || numberOfPeapleInBedrooms == null){
            const error = new CustomError('Bad Request',400,'Bad Request','Number Of Peaple In Bedrooms is required');
            return res.status(400).json(error.toJson('Number Of Peaple In Bedrooms is required'));
        }
        if(homeConditionsId == "" || homeConditionsId == null){
            const error = new CustomError('Bad Request',400,'Bad Request','Home Conditions Id is required');
            return res.status(400).json(error.toJson('Home Conditions Id is required'));
        }

        const homeConditions = new HomeConditions(
            typeResidence,
            materialOfExternalWalls,
            hasAcessEnergy,
            waterSupply,
            sewageDisposal,
            garbageCollection,
            hasWasteCollection,
            homeConditionIsInRiskArea,
            difficultyToAccessHome,
            hasHomeInsurance,
            hasHomeInsuranceValue,
            numberOfRooms,
            numberOfBedrooms,
            numberOfPeapleInBedrooms
        )

        const homeConditionsCreated = await userControle.createHomeConditions(homeConditions,homeConditionsId);
        return res.status(201).json(homeConditionsCreated);
    }catch(e){
        console.log(e)
        if(e instanceof CustomError){
            res.status(e.statusCode).json(e.toJson(e.message));
        }else{
            res.status(500).json({error:'Internal server error'});
        }
    }
})

userRouter.post('/create/family/composition/observation',async (req,res)=>{
    try{
        const {observation,whoIsObservingId,familyCompositionID} = req.body;
        if(!observation){
            const error = new CustomError('Bad Request',400,'Bad Request','Observation is required');
            return res.status(400).json(error.toJson('Observation is required'));
        }
        if(!whoIsObservingId){
            const error = new CustomError('Bad Request',400,'Bad Request','Who Is Observing Id is required');
            return res.status(400).json(error.toJson('Who Is Observing Id is required'));
        }
        if(!familyCompositionID){
            const error = new CustomError('Bad Request',400,'Bad Request','Family Composition ID is required');
            return res.status(400).json(error.toJson('Family Composition ID is required'));
        }
        const newObservation = new Observations(observation,whoIsObservingId);
        const observationCreated = await userControle.createFamilyCompositionObservation(newObservation,familyCompositionID);
        return res.status(201).json(observationCreated);
    }catch(e){
        if(e instanceof CustomError){
            res.status(e.statusCode).json(e.toJson(e.message));
        }else{
            res.status(500).json({error:'Internal server error'});
        }
    }
})

userRouter.post('/create/etinical/documents',async (req,res)=>{ 
    try{
        let {document,familyCompositionID,personId} = req.body;
        
        if(!familyCompositionID){
            const error = new CustomError('Bad Request',400,'Bad Request','Family Composition ID is required');
            return res.status(400).json(error.toJson('Family Composition ID is required'));
        }

        if(!personId){
            const error = new CustomError('Bad Request',400,'Bad Request','Kinship is required');
            return res.status(400).json(error.toJson('Kinship is required'));
        }
        

        const documents = new Documents(document[0],document[1],document[2],document[3],document[4]);

        const familyComposition = await userControle.createDocuments(documents,familyCompositionID,personId);
        return res.status(201).json(familyComposition);
    }catch(e){
        if(e instanceof CustomError){
            res.status(e.statusCode).json(e.toJson(e.message));
        }else{
            res.status(500).json({error:'Internal server error'});
        }
    }
})

userRouter.post('/create/etnical/especifications',async (req,res)=>{
    try{
        const {etnicalEspecifications,familyCompositionID} = req.body;
        if(!etnicalEspecifications){
            const error = new CustomError('Bad Request',400,'Bad Request','Etnical Especifications is required');
            return res.status(400).json(error.toJson('Etnical Especifications is required'));
        }
        if(!familyCompositionID){
            const error = new CustomError('Bad Request',400,'Bad Request','Family Composition ID is required');
            return res.status(400).json(error.toJson('Family Composition ID is required'));
        }
        const familyComposition = await userControle.createEtnicalEspecifications(etnicalEspecifications,familyCompositionID);
        return res.status(201).json(familyComposition);
    }catch(e){
        if(e instanceof CustomError){
            res.status(e.statusCode).json(e.toJson(e.message));
        }else{
            res.status(500).json({error:'Internal server error'});
        }
    }
})

userRouter.post('/create/family/person',async (req,res)=>{
    try{
        const {fullname,birthDate,biologicalGender,kinship,personWithDisabilities,familyPersonId} = req.body;
        
        if(!fullname){
            const error = new CustomError('Bad Request',400,'Bad Request','Full Name is required');
            return res.status(400).json(error.toJson('Full Name is required'));
        }
        if(!birthDate){
            const error = new CustomError('Bad Request',400,'Bad Request','Birth Date is required');
            return res.status(400).json(error.toJson('Birth Date is required'));
        }

        if(!biologicalGender){
            const error = new CustomError('Bad Request',400,'Bad Request','biologicalGender is required');
            return res.status(400).json(error.toJson('biologicalGender is required'));
        }

        if(!kinship){
            const error = new CustomError('Bad Request',400,'Bad Request','Kinship is required');
            return res.status(400).json(error.toJson('Kinship is required'));
        }

        if(!familyPersonId){
            const error = new CustomError('Bad Request',400,'Bad Request','Family Person Id is required');
            return res.status(400).json(error.toJson('Family Person Id is required'));
        }

        if(!(typeof personWithDisabilities == "boolean") || personWithDisabilities == null){
            const error = new CustomError('Bad Request',400,'Bad Request','Person With Disabilities is required');
           return res.status(400).json(error.toJson('Person With Disabilities is required'));
        }

        const documents = new Documents(false,false,false,false,false);
        const dateArray = birthDate.split('/');
        const date = new Date(dateArray[2],dateArray[1],dateArray[0]);
        const familyCompositionPerson = new FamilyCompositionPerson(fullname,date,biologicalGender,personWithDisabilities,documents,kinship);
        const familyPerson = await userControle.createFamilyPerson(familyCompositionPerson,familyPersonId);
        return res.status(201).json(familyPerson);
    }catch(e){
        if(e instanceof CustomError){
            res.status(e.statusCode).json(e.toJson(e.message));
        }else{
            res.status(500).json({error:'Internal server error'});
        }
    }
});

userRouter.get('/list/first/entry/in/unity/:id',async (req,res)=>{
    try {
        const {id} = req.params;
        if(!id){
            const error = new CustomError('Bad Request',400,'Bad Request','First Entry In Unity Id is required');
            return res.status(400).json(error.toJson('First Entry In Unity Id is required'));
        }
        const firstEntryInUnity = await userControle.getFirstEntryInUnity(id);
        return res.status(200).json(firstEntryInUnity);
    } catch (e) {
        if(e instanceof CustomError){
            res.status(e.statusCode).json(e.toJson(e.message));
        }else{
            res.status(500).json({error:'Internal server error'});
        }
    }
})

userRouter.post('/create/first/entry/observation',async (req,res)=>{
    try {
        const {observation,whoIsObservingId,firstEntryInUnityId} = req.body;
        if(!observation){
            const error = new CustomError('Bad Request',400,'Bad Request','Observation is required');
            return res.status(400).json(error.toJson('Observation is required'));
        }
        if(!whoIsObservingId){
            const error = new CustomError('Bad Request',400,'Bad Request','Who Is Observing Id is required');
            return res.status(400).json(error.toJson('Who Is Observing Id is required'));
        }
        if(!firstEntryInUnityId){
            const error = new CustomError('Bad Request',400,'Bad Request','First Entry In Unity Id is required');
            return res.status(400).json(error.toJson('First Entry In Unity Id is required'));
        }
        const newObservation = new Observations(observation,whoIsObservingId);
        const observationCreated = await userControle.createFirstEntryInUnityObservation(firstEntryInUnityId,newObservation);
        return res.status(201).json(observationCreated);
    } catch (e) {
        if(e instanceof CustomError){
            res.status(e.statusCode).json(e.toJson(e.message));
        }else{
            res.status(500).json({error:'Internal server error'});
        }
    }
})

userRouter.post('/create/first/entry/in/unity',async (req,res)=>{
    try {
        const {firstEntryInUnity,motivationForFirstEntry,nameOfUnityToSendFirstEntry,ContactEmailOfUnityToSendFirstEntry,familyBenefits,whoIsResponsibleForFirstEntryId,firstEntryInUnityID} = req.body;
        
        if(!firstEntryInUnity){
            const error = new CustomError('Bad Request',400,'Bad Request','First Entry In Unity is required');
            return res.status(400).json(error.toJson('First Entry In Unity is required'));
        }
        if(!motivationForFirstEntry){
            const error = new CustomError('Bad Request',400,'Bad Request','Motivation For First Entry is required');
            return res.status(400).json(error.toJson('Motivation For First Entry is required'));
        }
        if(!nameOfUnityToSendFirstEntry){
            const error = new CustomError('Bad Request',400,'Bad Request','Name Of Unity To Send First Entry is required');
            return res.status(400).json(error.toJson('Name Of Unity To Send First Entry is required'));
        }
        if(!ContactEmailOfUnityToSendFirstEntry){
            const error = new CustomError('Bad Request',400,'Bad Request','Contact Email Of Unity To Send First Entry is required');
            return res.status(400).json(error.toJson('Contact Email Of Unity To Send First Entry is required'));
        }
        if(!familyBenefits){
            const error = new CustomError('Bad Request',400,'Bad Request','Family Benefits is required');
            return res.status(400).json(error.toJson('Family Benefits is required'));
        }
        
        if(!whoIsResponsibleForFirstEntryId){
            const error = new CustomError('Bad Request',400,'Bad Request','Who Is Responsible For First Entry Id is required');
            return res.status(400).json(error.toJson('Who Is Responsible For First Entry Id is required'));
        }

        if(!firstEntryInUnityID){
            const error = new CustomError('Bad Request',400,'Bad Request','First Entry In Unity ID is required');
            return res.status(400).json(error.toJson('First Entry In Unity ID is required'));
        }

        const newFirstEntryInUnity = new FirstEntryInUnity(
            firstEntryInUnity,
            motivationForFirstEntry,
            familyBenefits,
            true,
            new Date(),
            new Date(),
            nameOfUnityToSendFirstEntry,
            ContactEmailOfUnityToSendFirstEntry,
            firstEntryInUnity
        );

        const firstEntryInUnityCreated = await userControle.firstEntryInUnity(newFirstEntryInUnity,firstEntryInUnityID);
        return res.status(201).json(firstEntryInUnityCreated);

    } catch (e) {
        if(e instanceof CustomError){
            res.status(e.statusCode).json(e.toJson(e.message));
        }else{
            res.status(500).json({error:'Internal server error'});
        }
    }
})

userRouter.get('/list/reference/person/observation/:id',async (req,res)=>{
    try {
        const {id} = req.params;
        const referencePerson = await userControle.getReferencePersonWithObservations(id);
        return res.status(200).json(referencePerson);
    } catch (err) {
        return res.status(500).json(err);
    }
})

userRouter.get('/list/reference/person/:id',async (req,res)=>{
    try {
        const {id} = req.params;
        const referencePerson = await userControle.getByIdReferencePerson(id);
        return res.status(200).json(referencePerson);
    } catch (err) {
        return res.status(500).json(err);
    }
})

userRouter.get('/list/reference/person',async (req,res)=>{
    try {
        const referencePerson = await userControle.listAllReferencePerson();
        return res.status(200).json(referencePerson);
    } catch (err) {
        return res.status(500).json(err);
    }
})

userRouter.get('/list/reduced/reference/person',async (req,res)=>{
    throw new Error('Not Implemented');
})

userRouter.post('/create/reference/person/observation',async (req,res)=>{
    const {observation,whoIsObservingId,referencePersonId} = req.body;
    try {
        if(!observation){
            const error = new CustomError('Bad Request',400,'Bad Request','Observation is required');
            return res.status(400).json(error.toJson('Observation is required'));
        }
        if(!whoIsObservingId){
            const error = new CustomError('Bad Request',400,'Bad Request','Who Is Observing Id is required');
            return res.status(400).json(error.toJson('Who Is Observing Id is required'));
        }
        if(!referencePersonId){
            const error = new CustomError('Bad Request',400,'Bad Request','Reference Person Id is required');
            return res.status(400).json(error.toJson('Reference Person Id is required'));
        }
        const newObservation = new Observations(observation,whoIsObservingId);
        const observationCreated = await userControle.createReferencePersonObservation(newObservation,referencePersonId);
        return res.status(201).json(observationCreated);
    } catch (err) {
        return res.status(500).json(err);
    }
})

userRouter.post('/create/reference/person',async (req,res)=>{
    try {
        const {fullName,socialName,motherName,cpf,nis,diagnosis,rgNumber,rgUf,rgIssue,rgDateIssue,isShelter,localLocalization,cep,adress,neighborhood,adressNumber,adressComplement,state,city,phone,whoIsObservingId,birthDate,biologicalGender} = req.body;

        if(!birthDate){
            const error = new CustomError('Bad Request',400,'Bad Request','Birth Date is required');
            return res.status(400).json(error.toJson('Birth Date is required'));
        }

        if(!biologicalGender){
            const error = new CustomError('Bad Request',400,'Bad Request','biologicalGender is required');
            return res.status(400).json(error.toJson('biologicalGender is required'));
        }

        if(!whoIsObservingId){
            const error = new CustomError('Bad Request',400,'Bad Request','Who Is Observing Id is required');
            return res.status(400).json(error.toJson('Who Is Observing Id is required'));
        }

        if(!fullName){
            const error = new CustomError('Bad Request',400,'Bad Request','Full Name is required');
            return res.status(400).json(error.toJson('Full Name is required'));
        }

        if(!socialName){
            const error = new CustomError('Bad Request',400,'Bad Request','Social Name is required');
            return res.status(400).json(error.toJson('Social Name is required'));
        }

        if(!motherName){
            const error = new CustomError('Bad Request',400,'Bad Request','Mother Name is required');
            return res.status(400).json(error.toJson('Mother Name is required'));
        }

        if(!cpf){
            const error = new CustomError('Bad Request',400,'Bad Request','Cpf is required');
            return res.status(400).json(error.toJson('Cpf is required'));
        }

        if(!diagnosis){
            const error = new CustomError('Bad Request',400,'Bad Request','Diagnosis is required');
            return res.status(400).json(error.toJson('Diagnosis is required'));
        }

        if(!rgNumber){
            const error = new CustomError('Bad Request',400,'Bad Request','Rg Number is required');
            return res.status(400).json(error.toJson('Rg Number is required'));
        }

        if(!rgUf){
            const error = new CustomError('Bad Request',400,'Bad Request','Rg Uf is required');
            return res.status(400).json(error.toJson('Rg Uf is required'));
        }

        if(!rgIssue){
            const error = new CustomError('Bad Request',400,'Bad Request','Rg Issue is required');
            return res.status(400).json(error.toJson('Rg Issue is required'));
        }

        if(!rgDateIssue){
            const error = new CustomError('Bad Request',400,'Bad Request','Rg Date Issue is required');
            return res.status(400).json(error.toJson('Rg Date Issue is required'));
        }

        if(!(typeof isShelter == "boolean") || isShelter == null){
            const error = new CustomError('Bad Request',400,'Bad Request','Is Shelter is required');
            return res.status(400).json(error.toJson('Is Shelter is required'));
        }

        if(!localLocalization){
            const error = new CustomError('Bad Request',400,'Bad Request','Local Localization is required');
            return res.status(400).json(error.toJson('Local Localization is required'));
        }


        if(!adress){
            const error = new CustomError('Bad Request',400,'Bad Request','Adress is required');
            return res.status(400).json(error.toJson('Adress is required'));
        }

        if(!neighborhood){
            const error = new CustomError('Bad Request',400,'Bad Request','Neighborhood is required');
            return res.status(400).json(error.toJson('Neighborhood is required'));
        }

        if(!adressNumber){
            const error = new CustomError('Bad Request',400,'Bad Request','Adress Number is required');
            return res.status(400).json(error.toJson('Adress Number is required'));
        }

        if(!adressComplement){
            const error = new CustomError('Bad Request',400,'Bad Request','Adress Complement is required');
            return res.status(400).json(error.toJson('Adress Complement is required'));
        }

        if(!state){
            const error = new CustomError('Bad Request',400,'Bad Request','State is required');
            return res.status(400).json(error.toJson('State is required'));
        }

        if(!city){
            const error = new CustomError('Bad Request',400,'Bad Request','City is required');
            return res.status(400).json(error.toJson('City is required'));
        }

        if(!phone){
            const error = new CustomError('Bad Request',400,'Bad Request','Phone is required');
            return res.status(400).json(error.toJson('Phone is required'));
        }
        
        const convertCorrectFormat = converterDataStringParaIsoUtc(birthDate);
        const birthDateFormatted = new Date(convertCorrectFormat);
        const newReferencePerson = new ReferencePerson('0', fullName,socialName,motherName,nis,cpf,diagnosis,rgNumber,biologicalGender,rgUf,rgIssue,rgDateIssue,isShelter,localLocalization,cep,adress,neighborhood,adressNumber,adressComplement,state,city,phone,birthDateFormatted,whoIsObservingId);
        const referencePerson = await userControle.createReferencePerson(newReferencePerson);
        return res.status(201).json(referencePerson);
       
    } catch (err:any) {
        return res.status(err.statusCode || 500).json({error: err.message || 'Internal server error'});
    }
})

userRouter.post('/create/adm',async (req,res)=>{
    try{
        const {email,fullName,admEmail} = req.body;
        const superAdmEmail = process.env.SUPER_ADM_EMAIL;
        const isSuperAdm = superAdmEmail === admEmail;

        if(!isSuperAdm){
            const error = new CustomError('Bad Request',400,'Bad Request','You are not allowed to create a new adm');
            return res.status(400).json(error.toJson('You are not allowed to create a new adm'));
        }

        if(!email){
            const error = new CustomError('Bad Request',400,'Bad Request','Email is required');
            return res.status(400).json(error.toJson('Email is required'));
        }
        if(!fullName){
            const error = new CustomError('Bad Request',400,'Bad Request','Full Name is required');
            return res.status(400).json(error.toJson('Full Name is required'));
        }
        const newUser = new User(0,fullName,email,'Senh@123',null,UserRole.admin.toString(),new Date(),new Date(),true);
        const user = await userControle.create(newUser,true);
        return res.status(201).json(user);

    }catch(e){
        return res.status(500).json(e);
    }
});

userRouter.post('/create/user',async (req,res)=>{
    try{
        const {admEmail,email,fullName,crm} = req.body;
        if(!email){
            const error = new CustomError('Bad Request',400,'Bad Request','Email is required');
            return res.status(400).json(error.toJson('Email is required'));
        }
        if(!fullName){
            const error = new CustomError('Bad Request',400,'Bad Request','Full Name is required');
            return res.status(400).json(error.toJson('Full Name is required'));
        }
        if(!crm){
            const error = new CustomError('Bad Request',400,'Bad Request','Crm is required');
            return res.status(400).json(error.toJson('Crm is required'));
        }
        const isAdm = (await userControle.findByEmail(admEmail) as User).role === UserRole.admin.toString();
        
        if(!isAdm){
            const error = new CustomError('Bad Request',400,'Bad Request','You are not allowed to create a new user');
            return res.status(400).json(error.toJson('You are not allowed to create a new user'));
        }

        const newUser = new User(0,fullName,email,'Senh@123',crm,UserRole.user.toString(),new Date(),new Date(),true);
        const user = await userControle.create(newUser,false);
        return res.status(201).json(user);

    }catch(e){
        console.log(e);
        return res.status(500).json(e);
    }
});

export default userRouter;