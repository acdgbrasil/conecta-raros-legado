import { User } from '../../domain/entity/user.js';
import {  UserRepository} from '../../domain/repository/userRepository.js';
import { CustomError } from '../error/error.js';
import { AuthRepository } from '../../domain/repository/authRepository.js';
import { createCode, findCode } from './mongodb/mongoDtos/mongodbDto.js';
import { AdmRepository } from '../../domain/repository/admRepository.js';
import { ReferencePerson } from '../../domain/entity/referencePerson.js';
import { Observations } from '../../domain/entity/observations.js';
import { createReferencePerson, createReferencePersonObservation, getByIdReferencePerson, listAllReferencePerson } from './mongodb/mongoDtos/personReferenceDTO.js';
import { FirstEntryInUnity } from '../../domain/entity/firstEntryInUnity.js';
import { createFirstEntryInUnity, createFirstEntryInUnityObservation, getFirstEntryInUnity } from './mongodb/mongoDtos/firstEntryInUnityDTO.js';
import { FamilyCompositionPerson, FamilyComposition, Documents, WorkConditionPerson, EducationConditionPerson, Pregnant } from '../../domain/entity/familyComposition.js';
import { createDocuments, createEtnicalEspecifications, createFamilyCompositionObservation, createFamilyComunitaryConvivationPersonDTO, createFamilyEducationCondition, createFamilyHistorySocioEducationPersonDto, createFamilyPerson, createPregnant, createSocialEspecifications, familyHealthyConditionDto, familyHistoryIntitutionalPersonDto, getFamilyCompositonPersonsDto, getInformationOfPersonAndAgeAreInSchool, insertLaOrPSCInformationDto } from './mongodb/mongoDtos/familyCompositionDto.js';
import { HomeConditions } from '../../domain/entity/homeConditions.js';
import { createHomeConditionsdDTO, createHomeConditionsObservation } from './mongodb/mongoDtos/homeConditionsModelDTO.js';
import { WorkCondition } from '../../domain/entity/workCondition.js';
import { createWorkConditionPersonDto, workConditionObservation } from './mongodb/mongoDtos/workConditionDto.js';
import { FamilySituationViolation } from '../../domain/entity/familySituationViolation.js';
import { familySituationViolenceDTO, familySituationViolenceObservation } from './mongodb/mongoDtos/familySituationViolenceDTO.js';
import { HealthyConditionFamily } from '../../domain/entity/familyHealthyCondition.js';
import { HealthyCondition } from '../../domain/entity/healthCondition.js';
import { createHealthConditionDto, createHealthConditionObsertionDto } from './mongodb/mongoDtos/healthConditionDto.js';
import { FamilyEventlyBenefits } from '../../domain/entity/familyEnvetlyBenefits.js';
import { createFamilyEventlyBenefitsDto, createFamilyEventlyBenefitsObservationDto } from './mongodb/mongoDtos/familyEventlyBenefitsDto.js';
import { FamilyAndCommunity } from '../../domain/entity/familyAndCommunity.js';
import { createFamilyAndCommunityDto, createFamilyAndCommunityObservationDto } from './mongodb/mongoDtos/familyAndCommunityDto.js';
import { FamilyComunitaryConvivation } from '../../domain/entity/familyComunitaryConvivation.js';
import { FamilyHistoryOfComplianceSocioEducationalMeasures } from '../../domain/entity/familyHistoryOfComplianceSocioEducationalMeasures.js';
import { createAnotationsOfPersons, createFamilyHistoryOfComplianseSocioEducationalMensureObservation,  } from './mongodb/mongoDtos/familyHistoryOfComplianseSocioEducationalMensureDto.js';
import { FamilyHistorySocioEducation } from '../../domain/entity/familyHistorySocioEducation.js';
import { FamilyHistoryInstitutionalComplet } from '../../domain/entity/familyHistoryInstitutionalComplet.js';
import { familyHistoryIntitutionalCompletDto, familyHistoryIntitutionalCompletObservationDto } from './mongodb/mongoDtos/familyHistoryInstitutionalCompletDTO.js';
import { FamilyInstitucionalHistory } from '../../domain/entity/familyInstitucionalHistory.js';
import { CryptoService } from '../encrypt/encryptService.js';
import { _verifyPassEmailToken } from '../jwt/jwtToken.js';
import { JwtPayload } from 'jsonwebtoken';
export class DatabaseService implements UserRepository, AuthRepository,AdmRepository{
    createFamilyHistoryInstitutionalComplets(familyHistoryInstitutionalComplet: FamilyHistoryInstitutionalComplet, familyHistoryInstitutionalCompletId: string, familuInstitucionalHistoryPerson: FamilyInstitucionalHistory, familyCompositionId: string, personId: string): Promise<FamilyHistoryInstitutionalComplet> {
        try{
            const familyHistory = familyHistoryIntitutionalCompletDto(familyHistoryInstitutionalComplet, familyHistoryInstitutionalCompletId);
            const __ = familyHistoryIntitutionalPersonDto(familuInstitucionalHistoryPerson, familyCompositionId, personId);
            return familyHistory;
        }catch(e){throw e}
    }
 
    createFamilyHistoryInstitutionalCompletObservation(familyHistoryInstitutionalCompletId: string, observation: Observations): Promise<FamilyHistoryInstitutionalComplet> {
        try{
            const familyHistory = familyHistoryIntitutionalCompletObservationDto(observation, familyHistoryInstitutionalCompletId);
            return familyHistory;
        }catch(e){throw e}
    }

    createFamilyHistoryOfComplianseSocioEducationalMensureObservation(familyHistoryOfComplianseSocioEducationalMensureId: string, observation: Observations): Promise<FamilyHistoryOfComplianceSocioEducationalMeasures> {
        try{
            const familyHistory = createFamilyHistoryOfComplianseSocioEducationalMensureObservation(familyHistoryOfComplianseSocioEducationalMensureId, observation);
            return familyHistory;
        }catch(e){throw e}
    }
    
    createFamilyHistoryOfComplianseSocioEducationalMensure(laOrPSCInfomation:boolean, createFamilyHistoryOfComplianseSocioEducationalMensureId: string, familyHistorySocioEducation: FamilyHistorySocioEducation, familyCompositionId: string, personId: string, anotationsOfPersons: string): Promise<FamilyHistoryOfComplianceSocioEducationalMeasures> {
        try{
            const _ = createFamilyHistorySocioEducationPersonDto(familyHistorySocioEducation, familyCompositionId, personId);
            const familyHistory = createAnotationsOfPersons(anotationsOfPersons, createFamilyHistoryOfComplianseSocioEducationalMensureId);
            const __ = insertLaOrPSCInformationDto(familyCompositionId,personId,laOrPSCInfomation);
            return familyHistory;
        }catch(e){throw e}
    }
   
    createFamilyComunitaryConvivationPerson(familyComunitaryConvivation: FamilyComunitaryConvivation, familyCompositionID: string, id: string): Promise<FamilyComposition> {
        try{
            const familyComposition = createFamilyComunitaryConvivationPersonDTO(familyComunitaryConvivation, familyCompositionID, id);
            return familyComposition;
        }catch(e){
            throw e;
        }
    }

    createFamilyAndCommunity(familyAndCommunity: FamilyAndCommunity, familyAndCommunityId: string): Promise<FamilyAndCommunity> {
        try{
            const familyAndCommunityResult = createFamilyAndCommunityDto(familyAndCommunity, familyAndCommunityId);
            return familyAndCommunityResult;
        }catch(e){
            throw e;
        }
    }
    createFamilyAndCommunityObservation(familyAndCommunityId: string, observation: Observations): Promise<FamilyAndCommunity> {
        try{
            const familyAndCommunity = createFamilyAndCommunityObservationDto(familyAndCommunityId, observation);
            return familyAndCommunity;
        }catch(e){
            throw e;
        }
    }

    createFamilyEventlyBenefitsObservation(familyEventlyBenefitsId: string, observation: Observations): Promise<FamilyEventlyBenefits> {
        try{
            const familyBenefits = createFamilyEventlyBenefitsObservationDto(familyEventlyBenefitsId, observation);
            return familyBenefits;
        }catch(e){
            throw e;
        }
    }
    createFamilyEventlyBenefits(familyEventlyBenefits: FamilyEventlyBenefits, familyEventlyBenefitsId: string): Promise<FamilyEventlyBenefits> {
        try{  
            const familyBenefits = createFamilyEventlyBenefitsDto(familyEventlyBenefits, familyEventlyBenefitsId);
            return familyBenefits;
        }catch(e){
            throw e;
        }
    }
    createSituationViolationObservation(situationViolationId: string, observation: Observations): Promise<FamilySituationViolation> {
        try{
            const familySituation = familySituationViolenceObservation(situationViolationId, observation);
            return familySituation;
        }catch(e){
            throw e;
        }
    }
    createHealthConditionObservation(healthConditionId: string, observation: Observations): Promise<HealthyCondition> {
        try{
            const healthyCondition = createHealthConditionObsertionDto(healthConditionId, observation);
            return healthyCondition;
        }catch(e){
            throw e;
        }
    }
    async createHealthCondition(HealthyCondition: HealthyCondition, healthConditionId: string, familyHealthyCondition: HealthyConditionFamily, familyCompositionID: string, personId: string,pregnant:Pregnant): Promise<HealthyCondition> {
        try{
            const healthyCondition = await createHealthConditionDto(HealthyCondition,healthConditionId);
            const _ = await familyHealthyConditionDto(familyHealthyCondition, familyCompositionID, personId);
            const __ = await createPregnant(pregnant,familyCompositionID,personId);
            return healthyCondition;
        }catch(e){
            throw e;
        }
    }
    createWorkConditionObservation(workConditionId: string, observation: string): Promise<WorkCondition> {
        try{
            const workCondition = workConditionObservation(workConditionId, observation);
            return workCondition;
        }catch(e){
            throw e;
        }
    }
    async getInformationOfPersonAndAgeAreInSchool(familyCompositionId: string): Promise<FamilyComposition> {
        try{
            const information = getInformationOfPersonAndAgeAreInSchool(familyCompositionId);
            return information;
        }catch(e){
            throw e;
        }
    }
    
    async getFamilyCompositonPersons(familyCompositionId: string): Promise<FamilyCompositionPerson[]> {
        try{
            const familyCompositionPersons = await getFamilyCompositonPersonsDto(familyCompositionId);
            return familyCompositionPersons;
        }catch(e){
            throw e;
        }
    }

    async createEducationalEspecifications(educationalEspecifications: EducationConditionPerson, familySituationId: string,personId:string): Promise<FamilyComposition> {
        try{
            const familySituation = await createFamilyEducationCondition(educationalEspecifications,familySituationId,personId);
            return familySituation;
        }catch(e){
            throw e;
        }
    }
    createSituationViolation(situationViolation: FamilySituationViolation, familySituationId: string): Promise<FamilySituationViolation> {
        try{
            const familySituation = familySituationViolenceDTO(familySituationId, situationViolation);
            return familySituation;
        }catch(e){
            throw e;
        }
    }
    
    
    async createWorkConditionPerson(workCondition: WorkCondition,workConditionPerson:WorkConditionPerson,familyCompositionID: string,personId:String,workConditionId:string): Promise<WorkCondition> {
        try{
            const workConditionResult = await createWorkConditionPersonDto(workCondition, workConditionPerson, familyCompositionID, personId, workConditionId);
            return workConditionResult;
        }catch(e){
            throw e;
        }
    }
    
    async createHomeConditions(homeConditions: HomeConditions, homeConditionsId: string): Promise<HomeConditions | Error> {
        try{
            const familyComposition = await createHomeConditionsdDTO(homeConditions, homeConditionsId);
            return familyComposition;
        }catch(e){
            throw e;
        }
    }
    
    createHomeConditionsObservation(observation: Observations, homeConditionsId: string): Promise<HomeConditions | Error> {
        try{
            const familyComposition = createHomeConditionsObservation(observation, homeConditionsId);
            return familyComposition;
        }catch(e){
            throw e;
        }
    }
    async createEtnicalEspecifications(etnicalEspecifications: string, familyCompositionID: string): Promise<FamilyComposition | Error> {
        try{
            const familyComposition = await createEtnicalEspecifications(etnicalEspecifications, familyCompositionID);
            return familyComposition;
        }catch(e){
            throw e;
        }
    }
    async createDocuments(documents: Documents, familyCompositionID: string, id: string): Promise<FamilyComposition | Error> {
        try{
            const familyComposition = await createDocuments(documents, familyCompositionID, id);
            return familyComposition;
        }catch(e){
            throw e;
        }
    }
    async createSocialEspecifications(socialEspecifications: string, familyCompositionID: string): Promise<FamilyComposition | Error> {
        try{
            const familyComposition = await createSocialEspecifications(socialEspecifications, familyCompositionID);
            return familyComposition;
        }catch(e){
            throw e;
        }
    }
    async createFamilyCompositionObservation(observation: Observations, familyCompositionID: string): Promise<FamilyComposition | Error> {
        try{
            const observationResult = await createFamilyCompositionObservation(observation, familyCompositionID);
            return observationResult;
        }catch(e){
            throw e;
        }
    }
    async createFamilyPerson(familyCompositionPerson: FamilyCompositionPerson, familyCompositionID: string): Promise<FamilyComposition | Error> {
        try{
            const familyComposition = await createFamilyPerson(familyCompositionPerson, familyCompositionID);
            return familyComposition;
        }catch(e){
            throw e;
        }
    }
    async getFirstEntryInUnity(firstEntryInUnityId: string): Promise<FirstEntryInUnity | Error> {
        try{
            const firstEntry = await getFirstEntryInUnity(firstEntryInUnityId);
            return firstEntry;
        }catch(e){
            throw e;
        }
    }
    createFirstEntryInUnityObservation(firstEntryInUnityId: string, observation: Observations): Promise<FirstEntryInUnity | Error> {
        try{
            const firstEntry = createFirstEntryInUnityObservation(firstEntryInUnityId, observation);
            return firstEntry;
        }catch(e){
            throw e;
        }
    }

    async firstEntryInUnity(firstEntry: FirstEntryInUnity, firstEntryInUnityId: string): Promise<FirstEntryInUnity | Error> {
        try{
            const firstEntryResult = await createFirstEntryInUnity(firstEntry,firstEntryInUnityId);
            return firstEntryResult;
        }catch(e){
            throw e;
        }
    }
    
    async getReferencePersonWithObservations(id: string): Promise<ReferencePerson | Error> {
        throw new Error('Method not implemented.');
    }
    async getByIdReferencePerson(id: string): Promise<ReferencePerson | Error> {
        try {
            const referencePerson = await getByIdReferencePerson(id)
            if(!referencePerson){
                return new CustomError('REFERENCE_PERSON_NOT_FOUND', 404, 'REFERENCE_PERSON_NOT_FOUND', 'Reference Person not found')
            }
            return referencePerson as any
        }catch(err){
            throw err
        }
    }
    async listAllReferencePerson(): Promise<ReferencePerson[]> {
        try {
            const referencePersons = await listAllReferencePerson()
            return referencePersons as any[]
        } catch (err) {
            throw err
        }
    }
    async createReferencePersonObservation(observations: Observations, referencePersonId: string): Promise<Observations | Error> {
        try {
            const Observations = await createReferencePersonObservation(observations, referencePersonId)
            return observations
        } catch (err) {
            throw err
        }
    }
   
    async createReferencePerson(referencePerson: ReferencePerson): Promise<ReferencePerson | Error> {
        try {
            const rp = await createReferencePerson(referencePerson)
            return rp as any           
        } catch (err) {
            throw err
        }
    }
    
    async deactivateUser(email: string): Promise<Boolean | Error> {
        try{
            const result = await deactivateUser(email)
            return result
        }catch(err){
            throw err
        }
    }
    async listAllUsers(): Promise<User[] | Error> {
        try{
            const users = await listAllUsers()
            return users
        }catch(err){
            throw err
        }
    }

    async resetPassword(email: string, code: string, newPassword: string,emailToken:string): Promise<User> {
        try{
        const hasCode = await findCode(code);
        const isValidEmail = await findByEmail(email);
        if(!isValidEmail) throw new CustomError('USER_NOT_FOUND', 404,'USER_NOT_FOUND', 'User not found');
        const isTheCorrectEmail = _verifyPassEmailToken(emailToken);
        if(isTheCorrectEmail.get('hasError')) throw new CustomError('INVALID_EMAIL_TOKEN', 400,'INVALID_EMAIL_TOKEN', `${isTheCorrectEmail.get('value')}`);
        const value = isTheCorrectEmail.get('value')! as JwtPayload;
        if(value.pay !== email) throw new CustomError('INVALID_EMAIL', 400,'INVALID_EMAIL', 'Invalid email');
        if(!hasCode)  throw new CustomError('CODE_NOT_FOUND', 404,'CODE_NOT_FOUND', 'Code not found');
        const newUser = await changePassword(email, newPassword);
        await hasCode.deleteOne();
        return newUser;
        }catch(e){
            throw e;
        }
    }
    login(email: string, password: string): Promise<Object> {
        throw new Error('Method not implemented.');
    }
    async forgotPassword(email: string): Promise<string> {
        try{
            const user = await findByEmail(email);
            if(!user){
                throw new CustomError('USER_NOT_FOUND', 404,'USER_NOT_FOUND', 'User not found');
            }
            const code = Math.random().toString(36).substring(2, 7);
            const expiredCode = await createCode(code);
            return expiredCode.toJSON().code;
        }catch(e){
            throw e;
        }
    }
    async create(user: User, isAdm: boolean): Promise<User | Error> {
        try{
            const hasUser = await findByEmail(user.email);
            if(hasUser){
                throw new CustomError('USER_ALREADY_EXISTS', 409,'USER_ALREADY_EXISTS', 'User already exists');
            }
            if(isAdm){
                const createUser = await createADM(user);
                return createUser;
            }else{
                const createUser = await create(user);
                return createUser;
            }
        }catch(e){
            throw e;
        }
    }
    async findByEmail(email: string): Promise<any> {
        try{
            const user = await findByEmail(email);
            if(!user){
                throw new CustomError('USER_NOT_FOUND', 404,'USER_NOT_FOUND', 'User not found');
            }
            return user;
        }catch(e){
            throw e;
        }
    }

    async findById(id: string): Promise<any> {
        try{
            const user = await findById(id);
            if(!user){
                throw new CustomError('USER_NOT_FOUND', 404,'USER_NOT_FOUND', 'User not found');
            }
            return user;
        }catch(e){
            throw e;
        }
    }

    delete(email: string): Promise<User | Error> {
        throw new Error('Method not implemented.');
    }

}