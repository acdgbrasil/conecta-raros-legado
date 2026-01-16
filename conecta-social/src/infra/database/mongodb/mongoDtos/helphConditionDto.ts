import { HelphyCondition } from "../../../../domain/entity/healthCondition.js";
import { Observations } from "../../../../domain/entity/observations.js";
import { CustomError } from "../../../error/error.js";
import { helphyConditionModel } from "../models/helphyConditionModel.js";

export const createHelphyConditionDto = async (HelphyCondition:HelphyCondition,helphyConditionId:string) => {
    const hc = await helphyConditionModel.findById(helphyConditionId);
    if(!hc) throw new CustomError('HEALTH_CONDITION_NOT_FOUND',404,'HEALTH_CONDITION_NOT_FOUND','Health Condition not found');
    hc.familyMemberAbusesAlcoholList = HelphyCondition.familyMemberAbusesAlcoholList;
    hc.familyMemberAbusesDrugsList = HelphyCondition.familyMemberAbusesDrugsList;
    hc.familyMemberNeedsConstantCareList = HelphyCondition.familyMemberNeedsConstantCareList;
    hc.familyMemberUsesControlledMedicationList = HelphyCondition.familyMemberUsesControlledMedicationList;
    hc.hasFamilyIndicatesFoodInsecurity = HelphyCondition.hasFamilyIndicatesFoodInsecurity;
    hc.hasFamilyMemberAbusesAlcohol = HelphyCondition.hasFamilyMemberAbusesAlcohol;
    hc.hasFamilyMemberAbusesDrugs = HelphyCondition.hasFamilyMemberAbusesDrugs;
    hc.hasFamilyMemberNeedsConstantCare = HelphyCondition.hasFamilyMemberNeedsConstantCare;
    hc.hasFamilyMemberUsesControlledMedication = HelphyCondition.hasFamilyMemberUsesControlledMedication;
    hc.hasSevereIllness = HelphyCondition.hasSevereIllness;
    hc.severeIllnessList = HelphyCondition.severeIllnessList;
    hc.updatedAt = HelphyCondition.updatedAt;
    hc.createdAt = HelphyCondition.createdAt;
    hc.save();
    return hc.toObject();
}

export const getHelphyConditionDto = async (helphyConditionId:string) => {
    const hc = await helphyConditionModel.findById(helphyConditionId);
    if(!hc) throw new CustomError('HEALTH_CONDITION_NOT_FOUND',404,'HEALTH_CONDITION_NOT_FOUND','Health Condition not found');
    return hc.toObject();
}

export const createHelphyConditionObsertionDto = async (helphyConditionId:string,observation:Observations) => {
    const hc = await helphyConditionModel.findById(helphyConditionId);
    if(!hc) throw new CustomError('HEALTH_CONDITION_NOT_FOUND',404,'HEALTH_CONDITION_NOT_FOUND','Health Condition not found');
    hc.observations?.push(observation);
    hc.save();
    return hc.toObject();
}