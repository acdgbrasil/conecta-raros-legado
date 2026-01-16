import { Documents, FamilyCompositionPerson } from "../../../../domain/entity/familyComposition.js";
import { FamilySituationViolation } from "../../../../domain/entity/familySituationViolation.js";
import { Observations } from "../../../../domain/entity/observations.js";
import { ReferencePerson } from "../../../../domain/entity/referencePerson.js";
import { CustomError } from "../../../error/error.js";
import { familyAndCommunityModel } from "../models/familyAndCommunityModel.js";
import { familyCompositionModel } from "../models/familyCompositionModel.js";
import { familyEventlyBenefitsModel } from "../models/familyEventlyBenefitsModel.js";
import { FamilyHistoryInstitutionalCompletModel } from "../models/familyHistoryInstutionalCompletModel.js";
import { familyHistoryOfComplianceSocioEducationalMeasuresModel } from "../models/familyHistoryOfComplianceSocioEducationalMeasuresModel.js";
import { familySituationViolenceModel } from "../models/familySituationViolenceModel.js";
import { firstEntryInUnityModel } from "../models/firstEntryInUnityModel.js";
import { helphyConditionModel } from "../models/helphyConditionModel.js";
import { homeConditionsModel } from "../models/homeConditionsModel.js";
import { referencePersonModel } from "../models/referencePersonModel.js";
import { WorkConditionModel } from "../models/workConditionModel.js";


export const getByIdReferencePerson = async (id:string) => {
    try {
        const referencePerson = await referencePersonModel.findById(id);
        return referencePerson;
    } catch (error) {
        throw error
    }
}

export const listAllReferencePerson = async () => {
    try {
        const referencePerson = await referencePersonModel.find();
        return referencePerson;
    } catch (error) {
        throw error
    }
}

export const createReferencePersonObservation = async (observations:Observations,referencePersonId:string)=>{
    try {
        const getReferencePerson = await referencePersonModel.findById(referencePersonId);
        if(!getReferencePerson){
            throw new CustomError('REFERENCE_PERSON_NOT_FOUND',404,'REFERENCE_PERSON_NOT_FOUND','Reference Person not found');
        }

        getReferencePerson.observations?.push(observations);
        await getReferencePerson.save();
        return getReferencePerson;
    } catch (error) {
        throw error
    }
}

export const createReferencePerson = async (rp:ReferencePerson)=>{
    try {
        
        const _referencePerson = await referencePersonModel.findOne({cpf:rp.cpf});

        if(_referencePerson){
            throw new CustomError('CPF_ALREADY_EXISTS',400,'CPF_ALREADY_EXISTS','CPF already exists');
        }
        
        const familyComposition = await familyCompositionModel.create({
            isInUse:false,
        })
        const documents = new Documents(false,false,false,false,false)
        const familyCompositionReferencePerson = new FamilyCompositionPerson(rp.fullName,rp.birthDate,rp.biologicalGender,true,documents,1)
        familyComposition.familyCompositionPerson.push(familyCompositionReferencePerson)
        familyComposition.save()

        const fistEntryInUnity = await firstEntryInUnityModel.create({
            inInUse:false,
        })
        const homeCondition = await homeConditionsModel.create({
            inInUse:false,
        })
        const workCondition = await WorkConditionModel.create({
            inInUse:false,
        })
        const helphyCondition = await helphyConditionModel.create({
            inInUse:false,
        })
        const eventlyBenefit = await familyEventlyBenefitsModel.create({
            inInUse:false,
        })

        const familyAndCommunity = await familyAndCommunityModel.create({
            inInUse:false,
        })

        const familyHistoryOfComplienceSocialEducational = await familyHistoryOfComplianceSocioEducationalMeasuresModel.create({
            inInUse:false,
        })

        const FamilyHistoryInstitutionalComplet = await FamilyHistoryInstitutionalCompletModel.create({
            isInUse:false,
        })
        
        const childLabel = {thisSituationOcurrent:false,thisSituationsOcurrentNow:false}
        const sexualExploitation = {thisSituationOcurrent:false,thisSituationsOcurrentNow:false}
        const sexualAbuse = {thisSituationOcurrent:false,thisSituationsOcurrentNow:false}
        const physicalAbuse = {thisSituationOcurrent:false,thisSituationsOcurrentNow:false}
        const psychologicalAbuse = {thisSituationOcurrent:false,thisSituationsOcurrentNow:false}
        const elderNeglect = {thisSituationOcurrent:false,thisSituationsOcurrentNow:false}
        const childNeglect = {thisSituationOcurrent:false,thisSituationsOcurrentNow:false}
        const pcdNeglect = {thisSituationOcurrent:false,thisSituationsOcurrentNow:false}
        const homelessSituation = {thisSituationOcurrent:false,thisSituationsOcurrentNow:false}
        const humanTrafficking = {thisSituationOcurrent:false,thisSituationsOcurrentNow:false}
        const violenceWithElderOrPcd = {thisSituationOcurrent:false,thisSituationsOcurrentNow:false}
        const other = {thisSituationOcurrent:false,thisSituationsOcurrentNow:false,nameOfSituation:''}

        const familyViolation = new FamilySituationViolation(childLabel,sexualExploitation,sexualAbuse,physicalAbuse,psychologicalAbuse,elderNeglect,childNeglect,pcdNeglect,homelessSituation,humanTrafficking,violenceWithElderOrPcd,other,false)
        const familySituationViolation = await familySituationViolenceModel.create(familyViolation)
        

        const referencePerson = await referencePersonModel.create({
            fullName:rp.fullName,
            socialName:rp.socialName,
            adress:rp.adress,
            adressComplement:rp.adressComplement,
            adressNumber:rp.adressNumber,
            cep:rp.cep,
            city:rp.city,
            cpf:rp.cpf,
            diagnosis:rp.diagnosis,
            isShelter:rp.isShelter,
            localLocalization:rp.localLocalization,
            motherName:rp.motherName,
            neighborhood:rp.neighborhood,
            nis:rp.nis,
            phone:rp.phone,
            rg:rp.rg,
            state:rp.state,
            whoIsOpeningId:rp.whoIsOpeningId,
            fistEntryInUnityId:fistEntryInUnity.id,
            familyCompositionId:familyComposition.id,
            birthDate:rp.birthDate,
            biologicalGender:rp.biologicalGender,
            homeConditionsId:homeCondition.id,
            workConditionId:workCondition.id,
            familySituationViolationId:familySituationViolation.id,
            helphyConditionId:helphyCondition.id,
            eventlyBenefitId:eventlyBenefit.id,
            familyAndCommunityId:familyAndCommunity.id,
            familyHistoryOfComplianceSocialEducationalMensuresId:familyHistoryOfComplienceSocialEducational.id,
            familyHistoryInstitutionalCompletId:FamilyHistoryInstitutionalComplet.id
        })
        
        return referencePerson
        
    } catch (error) {
       throw error
    }
   }