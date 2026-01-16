import test from "node:test";
import { FamilyAndCommunity } from "../../domain/entity/familyAndCommunity.js";
import { FamilyCompositionPerson, FamilyComposition, Documents, WorkConditionPerson, EducationConditionPerson, Pregnant } from "../../domain/entity/familyComposition.js";
import { FamilyComunitaryConvivation } from "../../domain/entity/familyComunitaryConvivation.js";
import { FamilyEventlyBenefits } from "../../domain/entity/familyEnvetlyBenefits.js";
import { HelphyConditionFamily } from "../../domain/entity/familyHelphyCondition.js";
import { FamilyHistoryInstitutionalComplet } from "../../domain/entity/familyHistoryInstitutionalComplet.js";
import { FamilyHistoryOfComplianceSocioEducationalMeasures } from "../../domain/entity/familyHistoryOfComplianceSocioEducationalMeasures.js";
import { FamilyHistorySocioEducation } from "../../domain/entity/familyHistorySocioEducation.js";
import { FamilyInstitucionalHistory } from "../../domain/entity/familyInstitucionalHistory.js";
import { FamilySituationViolation } from "../../domain/entity/familySituationViolation.js";
import { FirstEntryInUnity } from "../../domain/entity/firstEntryInUnity.js";
import { HelphyCondition } from "../../domain/entity/healthCondition.js";
import { HomeConditions } from "../../domain/entity/homeConditions.js";
import { Observations } from "../../domain/entity/observations.js";
import { ReferencePerson } from "../../domain/entity/referencePerson.js";
import { User } from "../../domain/entity/user.js";
import { WorkCondition } from "../../domain/entity/workCondition.js";
import { UserRepository } from "../../domain/repository/userRepository.js";
import { DatabaseService } from "../../infra/database/databaseService.js";
import { CryptoService } from "../../infra/encrypt/encryptService.js";
import { CustomError } from "../../infra/error/error.js";
import { SmtpService } from "../../infra/smtp/smtpService.js";
import { templateNewUser } from "../../infra/smtp/resend/templates/template.js";

export class UserController implements UserRepository{
    createFamilyHistoryInstitutionalComplets(familyHistoryInstitutionalComplet: FamilyHistoryInstitutionalComplet, familyHistoryInstitutionalCompletId: string, familuInstitucionalHistoryPerson: FamilyInstitucionalHistory, familyCompositionId: string, personId: string): Promise<FamilyHistoryInstitutionalComplet> {
        try{
            const db = new DatabaseService();
            return db.createFamilyHistoryInstitutionalComplets(familyHistoryInstitutionalComplet,familyHistoryInstitutionalCompletId,familuInstitucionalHistoryPerson,familyCompositionId,personId);
        }catch(e){
            throw e;
        }
    }
    createFamilyHistoryInstitutionalCompletObservation(familyHistoryInstitutionalCompletId: string, observation: Observations): Promise<FamilyHistoryInstitutionalComplet> {
        try{
            const db = new DatabaseService();
            return db.createFamilyHistoryInstitutionalCompletObservation(familyHistoryInstitutionalCompletId,observation);
        }catch(e){
            throw e;
        }
    }
    createFamilyHistoryOfComplianseSocioEducationalMensure(laOrPSCInfomation: boolean, createFamilyHistoryOfComplianseSocioEducationalMensureId: string, familyHistorySocioEducation: FamilyHistorySocioEducation, familyCompositionId: string, personId: string, anotationsOfPersons: string): Promise<FamilyHistoryOfComplianceSocioEducationalMeasures> {
        try{
            const db = new DatabaseService();
            return db.createFamilyHistoryOfComplianseSocioEducationalMensure(laOrPSCInfomation,createFamilyHistoryOfComplianseSocioEducationalMensureId,familyHistorySocioEducation,familyCompositionId,personId,anotationsOfPersons);
        }catch(e){
            throw e;
        }
    }
  
    createFamilyHistoryOfComplianseSocioEducationalMensureObservation(familyHistoryOfComplianseSocioEducationalMensureId: string, observation: Observations): Promise<FamilyHistoryOfComplianceSocioEducationalMeasures> {
        try{
            const db = new DatabaseService();
            return db.createFamilyHistoryOfComplianseSocioEducationalMensureObservation(familyHistoryOfComplianseSocioEducationalMensureId,observation);
        }catch(e){
            throw e;
        }
    }
    createFamilyComunitaryConvivationPerson(familyComunitaryConvivation: FamilyComunitaryConvivation, familyCompositionID: string, id: string): Promise<FamilyComposition> {
        try{
            const db = new DatabaseService();
            return db.createFamilyComunitaryConvivationPerson(familyComunitaryConvivation,familyCompositionID,id);
        }catch(e){
            throw e;
        }
    }
    createFamilyAndCommunity(familyAndCommunity: FamilyAndCommunity, familyAndCommunityId: string): Promise<FamilyAndCommunity> {
        try{
            const db = new DatabaseService();
            return db.createFamilyAndCommunity(familyAndCommunity,familyAndCommunityId);
        }catch(e){
            throw e;
        }
    }
    createFamilyAndCommunityObservation(familyAndCommunityId: string, observation: Observations): Promise<FamilyAndCommunity> {
        try{
            const db = new DatabaseService();
            return db.createFamilyAndCommunityObservation(familyAndCommunityId,observation);
        }catch(e){
            throw e;
        }
        
    }
    createFamilyEventlyBenefitsObservation(familyEventlyBenefitsId: string, observation: Observations): Promise<FamilyEventlyBenefits> {
        try{
            const db = new DatabaseService();
            return db.createFamilyEventlyBenefitsObservation(familyEventlyBenefitsId,observation);
        }catch(e){
            throw e;
        }
    }
    createFamilyEventlyBenefits(familyEventlyBenefits: FamilyEventlyBenefits, familyEventlyBenefitsId: string): Promise<FamilyEventlyBenefits> {
        try{
            const db = new DatabaseService();
            return db.createFamilyEventlyBenefits(familyEventlyBenefits,familyEventlyBenefitsId);
        }catch(e){
            throw e;
        }
    }
    createSituationViolationObservation(situationViolationId: string, observation: Observations): Promise<FamilySituationViolation> {
        try{
            const db = new DatabaseService();
            return db.createSituationViolationObservation(situationViolationId,observation);
        }catch(e){
            throw e;
        }
    }
    createHelphyConditionObservation(helphyConditionId: string, observation: Observations): Promise<HelphyCondition> {
        try{
            const db = new DatabaseService();
            return db.createHelphyConditionObservation(helphyConditionId,observation);
        }catch(e){
            throw e;
        }
    }
    createHelphyCondition(HelphyCondition: HelphyCondition, helphyConditionId: string, familyHelphyCondition: HelphyConditionFamily, familyCompositionID: string, personId: string,pregnant:Pregnant): Promise<HelphyCondition> {
        try{
            const db = new DatabaseService();
            return db.createHelphyCondition(HelphyCondition,helphyConditionId,familyHelphyCondition,familyCompositionID,personId,pregnant);
        }catch(e){
            throw e;
        }
    }
    createWorkConditionObservation(workConditionId: string, observation: string): Promise<WorkCondition> {
        try{
            const db = new DatabaseService();
            return db.createWorkConditionObservation(workConditionId,observation);
        }catch(e){
            throw e;
        }
    }
    getInformationOfPersonAndAgeAreInSchool(familyCompositionId: string): Promise<FamilyComposition> {
        try{
            const db = new DatabaseService();
            return db.getInformationOfPersonAndAgeAreInSchool(familyCompositionId);
        }catch(e){
            throw e;
        }
    }
    getFamilyCompositonPersons(familyCompositionId: string): Promise<FamilyCompositionPerson[]> {
        try{
            const db = new DatabaseService();
            return db.getFamilyCompositonPersons(familyCompositionId);
        }catch(e){
            throw e;
        }
    }
    createEducationalEspecifications(educationalEspecifications: EducationConditionPerson, familySituationId: string, personId: string): Promise<FamilyComposition> {
       try{
            const db = new DatabaseService();
            return db.createEducationalEspecifications(educationalEspecifications,familySituationId,personId);
       }catch(e){
           throw e;
       }
    }
    createSituationViolation(situationViolation: FamilySituationViolation, familySituationId: string): Promise<FamilySituationViolation> {
        try{
            const db = new DatabaseService();
            return db.createSituationViolation(situationViolation,familySituationId);
        }catch(e){
            throw e;
        }
    }
    
    async createWorkConditionPerson(workCondition: WorkCondition,workConditionPerson:WorkConditionPerson,familyCompositionID: string,personId:String,workConditionId:string): Promise<WorkCondition> {
        try{
            const db = new DatabaseService();
            const workConditionResult = await db.createWorkConditionPerson(workCondition, workConditionPerson, familyCompositionID, personId, workConditionId);
            return workConditionResult;
        }catch(e){
            throw e;
        }
    }

    createHomeConditions(homeConditions: HomeConditions, homeConditionsId: string): Promise<HomeConditions | Error> {
        try{
            const db = new DatabaseService();
            return db.createHomeConditions(homeConditions,homeConditionsId);
        }catch(e){
            throw e;
        }
    }
    createHomeConditionsObservation(observation: Observations, homeConditionsId: string): Promise<HomeConditions | Error> {
        try{
            const db = new DatabaseService();
            return db.createHomeConditionsObservation(observation,homeConditionsId);
        }catch(e){
            throw e;
        }
    }

    async createEtnicalEspecifications(etnicalEspecifications: string, familyCompositionID: string): Promise<FamilyComposition | Error> {
        try{
            const db = new DatabaseService();
            return await db.createEtnicalEspecifications(etnicalEspecifications,familyCompositionID);
        }catch(e){
            throw e;
        }
    }

    async createDocuments(documents: Documents, familyCompositionID: string, id: string): Promise<FamilyComposition | Error> {
        try{
            const db = new DatabaseService();
            return await db.createDocuments(documents,familyCompositionID,id);
        }catch(e){
            throw e;
        }
    }

    async createSocialEspecifications(socialEspecifications: string, familyCompositionID: string): Promise<FamilyComposition | Error> {
        try{
            const db = new DatabaseService();
            return await db.createSocialEspecifications(socialEspecifications,familyCompositionID);
        }catch(e){
            throw e;
        }
    }


    async createFamilyCompositionObservation(observation: Observations, familyCompositionID: string): Promise<FamilyComposition | Error> {
        try{
            const db = new DatabaseService();
            return await db.createFamilyCompositionObservation(observation,familyCompositionID);
        }catch(e){
            throw e;
        }
    }

    async createFamilyPerson(familyCompositionPerson: FamilyCompositionPerson, familyCompositionID: string): Promise<FamilyComposition | Error> {
        try{
            const db = new DatabaseService();
            return await db.createFamilyPerson(familyCompositionPerson, familyCompositionID);
        }catch(e){
            throw e;
        }
    }

    async getFirstEntryInUnity(firstEntryInUnityId: string): Promise<FirstEntryInUnity | Error> {
        try{
            const db = new DatabaseService();
            return await db.getFirstEntryInUnity(firstEntryInUnityId);
        }catch(e){
            throw e;
        }
    }
    async createFirstEntryInUnityObservation(firstEntryInUnityId: string, observation: Observations): Promise<FirstEntryInUnity | Error> {
        try{
            const db = new DatabaseService();
            return await db.createFirstEntryInUnityObservation(firstEntryInUnityId, observation);
        }catch(e){
            throw e;
        }
    }
    async firstEntryInUnity(firstEntry: FirstEntryInUnity, firstEntryInUnityId: string): Promise<FirstEntryInUnity | Error> {
        try{
            const db = new DatabaseService();
            return await db.firstEntryInUnity(firstEntry,firstEntryInUnityId);
        }catch(e){
            throw e;
        }
    }

    async getReferencePersonWithObservations(id: string): Promise<ReferencePerson | Error> {
        try{
            const db = new DatabaseService();
            return await db.getReferencePersonWithObservations(id);
        }catch(e){
            throw e;
        }
    }
    async getByIdReferencePerson(id: string): Promise<ReferencePerson | Error> {
        try{
            const db = new DatabaseService();
            return await db.getByIdReferencePerson(id);
        }catch(e){
            throw e;
        }
    }
    async listAllReferencePerson(): Promise<ReferencePerson[]> {
        try{
            const db = new DatabaseService();
            return await db.listAllReferencePerson();
        }catch(e){
            throw e;
        }
    }
    
    async createReferencePersonObservation(observations: Observations, referencePersonId: string): Promise<Observations | Error> {
        try{
            const db = new DatabaseService();
            return await db.createReferencePersonObservation(observations,referencePersonId);
        }catch(e){
            throw e;
        }
    }
    async createReferencePerson(referencePerson: ReferencePerson): Promise<ReferencePerson | Error> {
        try {
            const db = new DatabaseService()
            const rp = await db.createReferencePerson(referencePerson)
            return rp
        } catch (err) {
            throw err
        }
    }
    async findByEmail(email: string): Promise<User | Error> {
        try{
            const db = new DatabaseService();
            return await db.findByEmail(email);
        }catch(e){
            throw e;
        }
    }
    async create(user: User, isAdm: boolean): Promise<User | Error> {
        try{
            const db = new DatabaseService();
            const cryptoService = new CryptoService();
            const hashPass = await cryptoService.hashPass(user.password);
            const newUser = new User(user.id,user.fullName,user.email,hashPass,user.crm,user.role,user.createdAt,user.updatedAt,user.isActive);
            const userCreate = await db.create(newUser,isAdm);
            if(userCreate != null){
                const smtp = new SmtpService();
                //'noreply@acdgbrasil.com.br',newUser.email,'Cadastro Realizando com sucesso','Cadastro Realizando com sucesso, a senha da sua conta é padrão. Por favor altere a senha: '+user.password,undefined
                const payload = {
                    from: 'noreply@conectararos.com.br',
                    to: newUser.email,
                    subject: 'Cadastro Realizado com sucesso',
                    html: templateNewUser(user.password),
                }
                const email = await smtp.sendGenericEmail(payload.from, payload.to, payload.subject, undefined, payload.html);
                if(!email) throw new CustomError('Internal Server Error',500,'Internal Server Error','Error to send email')
                return userCreate;
            }
            throw new CustomError('Internal Server Error',500,'Internal Server Error','Error to create user');
        }
        catch(e){
            throw e;
        }
    }
    delete(email: string): Promise<User | Error> {
        throw new Error("Method not implemented.");
    }
    async listAllUsers(): Promise<User[] | Error> {
        try{
            const databaseService = new DatabaseService()
            const users = await databaseService.listAllUsers()
            return users
        }catch(err){
            throw err
        }
    }

}