import { WorkConditionPerson } from "../../../../domain/entity/familyComposition.js";
import { WorkCondition } from "../../../../domain/entity/workCondition.js";
import { CustomError } from "../../../error/error.js";
import { familyCompositionModel } from "../models/familyCompositionModel.js";
import { WorkConditionModel } from "../models/workConditionModel.js";

export const createWorkConditionPersonDto = async (workCondition: WorkCondition,workConditionPerson:WorkConditionPerson,familyCompositionID: string,personId:String,workConditionId:string):Promise<WorkCondition> => {
    const familyComposition = await familyCompositionModel.findById(familyCompositionID)
    if(!familyComposition) throw new CustomError('FAMILY_COMPOSITION_NOT_FOUND',404,'FAMILY_COMPOSITION_NOT_FOUND','Family Composition not found')
    const resultWorkCondition = await WorkConditionModel.findById(workConditionId)
    if(!resultWorkCondition) throw new CustomError('WORK_CONDITION_NOT_FOUND',404,'WORK_CONDITION_NOT_FOUND','Work Condition not found')
    const familyCompositionPerson = familyComposition.familyCompositionPerson.find((person:any) => person._id == personId)
    if(!familyCompositionPerson) throw new CustomError('FAMILY_COMPOSITION_PERSON_NOT_FOUND',404,'FAMILY_COMPOSITION_PERSON_NOT_FOUND','Family Composition Person not found')
    familyCompositionPerson.workConditionPerson = workConditionPerson
    resultWorkCondition.bcpBenefitPerson = workCondition.bcpBenefitPerson
    resultWorkCondition.bolsaFamiliaValue = workCondition.bolsaFamiliaValue
    resultWorkCondition.bpcValue = workCondition.bpcValue
    resultWorkCondition.familyIncome = workCondition.familyIncome
    resultWorkCondition.hasRetiredPerson = workCondition.hasRetiredPerson
    resultWorkCondition.hasSocialIncome = workCondition.hasSocialIncome
    resultWorkCondition.othersValue = workCondition.othersValue
    resultWorkCondition.petiValue = workCondition.petiValue
    resultWorkCondition.totalFamilyIncome = workCondition.totalFamilyIncome
    resultWorkCondition.totalPerCapitaIncome = workCondition.totalPerCapitaIncome
    await resultWorkCondition.save()
    resultWorkCondition.isInUse = true
    familyComposition.isInUse = true
    const result = new WorkCondition(resultWorkCondition.familyIncome,resultWorkCondition.perCapitaIncome,resultWorkCondition.hasSocialIncome,resultWorkCondition.bolsaFamiliaValue,resultWorkCondition.bpcValue,resultWorkCondition.petiValue,resultWorkCondition.othersValue,resultWorkCondition.bcpBenefitPerson,resultWorkCondition.hasRetiredPerson,resultWorkCondition.totalFamilyIncome,resultWorkCondition.totalPerCapitaIncome)
    return result
}

export const workConditionObservation = async (workConditionId: string,observation: string):Promise<WorkCondition> => {
    try{
        const workCondition = await WorkConditionModel.findById(workConditionId)
        if(!workCondition) throw new CustomError('WORK_CONDITION_NOT_FOUND',404,'WORK_CONDITION_NOT_FOUND','Work Condition not found')
        workCondition.observations?.push(observation)
        await workCondition.save()
        return workCondition
    }catch(e){
        throw e;
    }
}