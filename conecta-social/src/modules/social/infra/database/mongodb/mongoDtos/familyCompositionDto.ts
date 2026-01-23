import { get } from "http";
import { Documents, EducationConditionPerson, FamilyComposition, FamilyCompositionPerson, Pregnant, WorkConditionPerson } from "../../../../domain/entity/familyComposition.js";
import { Observations } from "../../../../domain/entity/observations.js";
import { CustomError } from "../../../error/error.js";
import { familyCompositionModel } from "../models/familyCompositionModel.js";
import { WorkCondition } from "../../../../domain/entity/workCondition.js";
import { HealthyConditionFamily } from "../../../../domain/entity/familyHealthyCondition.js";
import { FamilyComunitaryConvivation } from "../../../../domain/entity/familyComunitaryConvivation.js";
import { FamilyHistorySocioEducation } from "../../../../domain/entity/familyHistorySocioEducation.js";
import { FamilyInstitucionalHistory } from "../../../../domain/entity/familyInstitucionalHistory.js";

export const getFamilyCompositonPersonsDto = async (familyCompositionId:string) => {
    try {
        const referencePerson = await familyCompositionModel.findById(familyCompositionId)
        if(!referencePerson) throw new CustomError('REFERENCE_PERSON_NOT_FOUND',404,'REFERENCE_PERSON_NOT_FOUND','Reference Person not found')
        return referencePerson.familyCompositionPerson
    } catch (err) {
        throw err 
    }
}

 export const getInformationOfPersonAndAgeAreInSchool = async (familyCompositionID:string): Promise<FamilyComposition> => {
    try {
        const familyComposition = await familyCompositionModel.findById(familyCompositionID)
        if(!familyComposition) throw new CustomError('FAMILY_COMPOSITION_NOT_FOUND',404,'FAMILY_COMPOSITION_NOT_FOUND','Family Composition not found')
        return familyComposition
    } catch (err) {
        throw err 
    }
}

export const createFamilyPerson = async (familyCompositionPerson:FamilyCompositionPerson,familyCompositionID:string) => {
    try {
        const familyComposition = await familyCompositionModel.findById(familyCompositionID)
        if(!familyComposition) throw new CustomError('FAMILY_COMPOSITION_NOT_FOUND',404,'FAMILY_COMPOSITION_NOT_FOUND','Family Composition not found')
        familyComposition.familyCompositionPerson.push(familyCompositionPerson)
        familyComposition.isInUse = true 
        familyComposition.save()
        return familyComposition
    } catch (err) {
        throw err 
    }
}

export const createFamilyEducationCondition = async (educationCondition:EducationConditionPerson,familyCompositionID:string,id:string) => {
    try {
        const familyComposition = await familyCompositionModel.findById(familyCompositionID)
        if(!familyComposition) throw new CustomError('FAMILY_COMPOSITION_NOT_FOUND',404,'FAMILY_COMPOSITION_NOT_FOUND','Family Composition not found')
        const familyCompositionPerson = familyComposition.familyCompositionPerson.find((person:any) => person._id == id)
        if(!familyCompositionPerson) throw new CustomError('FAMILY_COMPOSITION_PERSON_NOT_FOUND',404,'FAMILY_COMPOSITION_PERSON_NOT_FOUND','Family Composition Person not found')
        familyCompositionPerson.educationConditionPerson = educationCondition
        familyComposition.isInUse = true
        familyComposition.save()
        return familyComposition
    } catch (err) {
        throw err 
    }
}

export const familyHealthyConditionDto = async (familyHealthyCondition:HealthyConditionFamily,familyCompositionID:string,id:string) => {
    try {
        const familyComposition = await familyCompositionModel.findById(familyCompositionID)
        if(!familyComposition) throw new CustomError('FAMILY_COMPOSITION_NOT_FOUND',404,'FAMILY_COMPOSITION_NOT_FOUND','Family Composition not found')
        const familyCompositionPerson = familyComposition.familyCompositionPerson.find((person:any) => person._id == id)
        if(!familyCompositionPerson) throw new CustomError('FAMILY_COMPOSITION_PERSON_NOT_FOUND',404,'FAMILY_COMPOSITION_PERSON_NOT_FOUND','Family Composition Person not found')
        familyCompositionPerson.healthyConditionFamily = familyHealthyCondition
        familyComposition.isInUse = true
        familyComposition.save()
        return familyComposition
    } catch (err) {
        throw err 
    }
}

export const familyComunitaryConvivation = async (familyComunitaryConvivation:any,familyCompositionID:string,id:string) => {
    try {
        const familyComposition = await familyCompositionModel.findById(familyCompositionID)
        if(!familyComposition) throw new CustomError('FAMILY_COMPOSITION_NOT_FOUND',404,'FAMILY_COMPOSITION_NOT_FOUND','Family Composition not found')
        const familyCompositionPerson = familyComposition.familyCompositionPerson.find((person:any) => person._id == id)
        if(!familyCompositionPerson) throw new CustomError('FAMILY_COMPOSITION_PERSON_NOT_FOUND',404,'FAMILY_COMPOSITION_PERSON_NOT_FOUND','Family Composition Person not found')
        familyCompositionPerson.familyComunitaryConvivation = familyComunitaryConvivation
        familyComposition.isInUse = true
        familyComposition.save()
        return familyComposition
    } catch (err) {
        throw err 
    }
}

export const createParticipationAndSocialServices = async (participationAndSocialServices:any,familyCompositionID:string,id:string) => {
    try {
        const familyComposition = await familyCompositionModel.findById(familyCompositionID)
        if(!familyComposition) throw new CustomError('FAMILY_COMPOSITION_NOT_FOUND',404,'FAMILY_COMPOSITION_NOT_FOUND','Family Composition not found')
        const familyCompositionPerson = familyComposition.familyCompositionPerson.find((person:any) => person._id == id)
        if(!familyCompositionPerson) throw new CustomError('FAMILY_COMPOSITION_PERSON_NOT_FOUND',404,'FAMILY_COMPOSITION_PERSON_NOT_FOUND','Family Composition Person not found')
        familyCompositionPerson.participationAndSocialServices = participationAndSocialServices
        familyComposition.isInUse = true
        familyComposition.save()
        return familyComposition
    } catch (err) {
        throw err 
    }
}

export const createPregnant = async (pregnant:any,familyCompositionID:string,id:string) => {
    try {
        const familyComposition = await familyCompositionModel.findById(familyCompositionID)
        if(!familyComposition) throw new CustomError('FAMILY_COMPOSITION_NOT_FOUND',404,'FAMILY_COMPOSITION_NOT_FOUND','Family Composition not found')
        const familyCompositionPerson = familyComposition.familyCompositionPerson.find((person:any) => person._id == id)
        if(!familyCompositionPerson) throw new CustomError('FAMILY_COMPOSITION_PERSON_NOT_FOUND',404,'FAMILY_COMPOSITION_PERSON_NOT_FOUND','Family Composition Person not found')
        familyCompositionPerson.biologicalGender == "Masculino" ? familyCompositionPerson.pregnant = undefined : familyCompositionPerson.pregnant = pregnant
        if(pregnant.pregnancyMonths > 17) throw new CustomError('INVALID_PREGNANCY_MONTHS',400,'INVALID_PREGNANCY_MONTHS','Pregnancy months must be less than 17')
        familyComposition.isInUse = true
        familyComposition.save()
        return familyComposition
    } catch (err) {
        throw err 
    }
}

export const createFamilyHistorySocioEducation = async (familyHistorySocioEducation:any,familyCompositionID:string,id:string) => {
    try {
        const familyComposition = await familyCompositionModel.findById(familyCompositionID)
        if(!familyComposition) throw new CustomError('FAMILY_COMPOSITION_NOT_FOUND',404,'FAMILY_COMPOSITION_NOT_FOUND','Family Composition not found')
        const familyCompositionPerson = familyComposition.familyCompositionPerson.find((person:any) => person._id == id)
        if(!familyCompositionPerson) throw new CustomError('FAMILY_COMPOSITION_PERSON_NOT_FOUND',404,'FAMILY_COMPOSITION_PERSON_NOT_FOUND','Family Composition Person not found')
        familyCompositionPerson.familyHistorySocioEducation = familyHistorySocioEducation
        familyComposition.isInUse = true
        familyComposition.save()
        return familyComposition
    } catch (err) {
        throw err 
    }
}

export const createFamilyInstitutionalHistory = async (familyInstitutionalHistory:any,familyCompositionID:string,id:string) => {
    try {
        const familyComposition = await familyCompositionModel.findById(familyCompositionID)
        if(!familyComposition) throw new CustomError('FAMILY_COMPOSITION_NOT_FOUND',404,'FAMILY_COMPOSITION_NOT_FOUND','Family Composition not found')
        const familyCompositionPerson = familyComposition.familyCompositionPerson.find((person:any) => person._id == id)
        if(!familyCompositionPerson) throw new CustomError('FAMILY_COMPOSITION_PERSON_NOT_FOUND',404,'FAMILY_COMPOSITION_PERSON_NOT_FOUND','Family Composition Person not found')
        familyCompositionPerson.familyInstitutionalHistory = familyInstitutionalHistory
        familyComposition.isInUse = true
        familyComposition.save()
        return familyComposition
    } catch (err) {
        throw err 
    }
}

export const createEtnicalEspecifications = async (etnicalEspecifications:string,familyCompositionID:string) => {
    try {
        const familyComposition = await familyCompositionModel.findById(familyCompositionID)
        if(!familyComposition) throw new CustomError('FAMILY_COMPOSITION_NOT_FOUND',404,'FAMILY_COMPOSITION_NOT_FOUND','Family Composition not found')
        familyComposition.espeficationEthnicity = etnicalEspecifications
        familyComposition.isInUse = true
        familyComposition.save()
        return familyComposition
    } catch (err) {
        throw err 
    }
}

export const createDocuments = async (documents:Documents,familyCompositionID:string,id:string) => {
    try {
        const familyComposition = await familyCompositionModel.findById(familyCompositionID)
        if(!familyComposition) throw new CustomError('FAMILY_COMPOSITION_NOT_FOUND',404,'FAMILY_COMPOSITION_NOT_FOUND','Family Composition not found')
        const familyCompositionPerson = familyComposition.familyCompositionPerson.find((person:any) => person._id == id)
        if(!familyCompositionPerson) throw new CustomError('FAMILY_COMPOSITION_PERSON_NOT_FOUND',404,'FAMILY_COMPOSITION_PERSON_NOT_FOUND','Family Composition Person not found')
        familyCompositionPerson.documents = documents
        familyComposition.isInUse = true
        await familyComposition.save()
        return familyComposition
    } catch (err) {
        throw err 
    }
}

export const createSocialEspecifications = async (socialEspecifications:string,familyCompositionID:string) => {
    try {
        const familyComposition = await familyCompositionModel.findById(familyCompositionID)
        if(!familyComposition) throw new CustomError('FAMILY_COMPOSITION_NOT_FOUND',404,'FAMILY_COMPOSITION_NOT_FOUND','Family Composition not found')
        familyComposition.socialEspecification = socialEspecifications
        familyComposition.isInUse = true
        familyComposition.save()
        return familyComposition
    } catch (err) {
        throw err 
    }
}

export const createFamilyCompositionObservation = async (observation:Observations,familyCompositionID:string) => {
    try {
        const familyComposition = await familyCompositionModel.findById(familyCompositionID)
        if(!familyComposition) throw new CustomError('FAMILY_COMPOSITION_NOT_FOUND',404,'FAMILY_COMPOSITION_NOT_FOUND','Family Composition not found')
        familyComposition.observation.push(observation)
        familyComposition.isInUse = true
        familyComposition.save()
        return familyComposition
    } catch (err) {
        throw err 
    }
}

export const getFamilyComposition = async (familyCompositionID:string) => {
    try {
        const familyComposition = await familyCompositionModel.findById(familyCompositionID)
        if(!familyComposition) throw new CustomError('FAMILY_COMPOSITION_NOT_FOUND',404,'FAMILY_COMPOSITION_NOT_FOUND','Family Composition not found')
        return familyComposition
    } catch (err) {
        throw err 
    }
}

export const getAllFamilyComposition = async () => {
    try {
        const familyComposition = await familyCompositionModel.find()
        return familyComposition
    } catch (err) {
        throw err 
    }
}

export const createFamilyComunitaryConvivationPersonDTO = async (familyComunitaryConvivation:FamilyComunitaryConvivation,familyCompositionID:string,id:string) => {
    try {
        const familyComposition = await familyCompositionModel.findById(familyCompositionID)
        if(!familyComposition) throw new CustomError('FAMILY_COMPOSITION_NOT_FOUND',404,'FAMILY_COMPOSITION_NOT_FOUND','Family Composition not found')
        const familyCompositionPerson = familyComposition.familyCompositionPerson.find((person:any) => person._id == id)
        if(!familyCompositionPerson) throw new CustomError('FAMILY_COMPOSITION_PERSON_NOT_FOUND',404,'FAMILY_COMPOSITION_PERSON_NOT_FOUND','Family Composition Person not found')
        familyCompositionPerson.familyComunitaryConvivation = familyComunitaryConvivation
        familyComposition.isInUse = true
        familyComposition.save()
        return familyComposition
    } catch (err) {
        throw err 
    }
}

export const createFamilyHistorySocioEducationPersonDto = async (familyHistorySocioEducation:FamilyHistorySocioEducation,familyCompositionId:string,personId:string) => {
    try {
        const familyComposition = await familyCompositionModel.findById(familyCompositionId)
        if(!familyComposition) throw new CustomError('FAMILY_COMPOSITION_NOT_FOUND',404,'FAMILY_COMPOSITION_NOT_FOUND','Family Composition not found')
        const familyCompositionPerson = familyComposition.familyCompositionPerson.find((person:any) => person._id == personId)
        if(!familyCompositionPerson) throw new CustomError('FAMILY_COMPOSITION_PERSON_NOT_FOUND',404,'FAMILY_COMPOSITION_PERSON_NOT_FOUND','Family Composition Person not found')
        familyCompositionPerson.familyHistorySocioEducation = familyHistorySocioEducation
        familyComposition.isInUse = true
        familyComposition.save()
        return familyComposition
    } catch (err) {
        throw err 
    }
} 

export const insertLaOrPSCInformationDto = async (familyCompositionID:string,personId:string,laOrPSCInformation:boolean) => {
    try {
        const familyComposition = await familyCompositionModel.findById(familyCompositionID)
        if(!familyComposition) throw new CustomError('FAMILY_COMPOSITION_NOT_FOUND',404,'FAMILY_COMPOSITION_NOT_FOUND','Family Composition not found')
        
        const familyCompositionPerson = familyComposition.familyCompositionPerson.find((person:any) => person._id == personId)
        if(!familyCompositionPerson) throw new CustomError('FAMILY_COMPOSITION_PERSON_NOT_FOUND',404,'FAMILY_COMPOSITION_PERSON_NOT_FOUND','Family Composition Person not found')
        
        familyCompositionPerson.historySocialLaOrPSC = laOrPSCInformation
        familyComposition.isInUse = true
        familyComposition.save()

        return familyComposition
    } catch (err) {
        throw err 
    }
}

export const familyHistoryIntitutionalPersonDto = async (familuInstitucionalHistoryPerson:FamilyInstitucionalHistory,familyCompositionId:string,personId:string) => {
    try{
        const familyComposition = await familyCompositionModel.findById(familyCompositionId)
        if(!familyComposition) throw new CustomError('FAMILY_COMPOSITION_NOT_FOUND',404,'FAMILY_COMPOSITION_NOT_FOUND','Family Composition not found')
        const familyCompositionPerson = familyComposition.familyCompositionPerson.find((person:any) => person._id == personId)
        if(!familyCompositionPerson) throw new CustomError('FAMILY_COMPOSITION_PERSON_NOT_FOUND',404,'FAMILY_COMPOSITION_PERSON_NOT_FOUND','Family Composition Person not found')

        familyCompositionPerson.familyInstitutionalHistory = familuInstitucionalHistoryPerson
        familyComposition.isInUse = true
        familyComposition.save()
        return familyComposition
    }catch(e){
        throw e
    }
}