import { HealthyCondition } from "../../../../domain/entity/healthCondition.js";
import { Observations } from "../../../../domain/entity/observations.js";
import { CustomError } from "../../../error/error.js";
import { healthyConditionModel } from "../models/healthyConditionModel.js";

export const createHealthConditionDto = async (HealthyCondition:HealthyCondition,healthConditionId:string) => {
    const hc = await healthyConditionModel.findById(healthConditionId);
    if(!hc) throw new CustomError('HEALTH_CONDITION_NOT_FOUND',404,'HEALTH_CONDITION_NOT_FOUND','Health Condition not found');
    hc.familyMemberAbusesAlcoholList = HealthyCondition.familyMemberAbusesAlcoholList;
    hc.familyMemberAbusesDrugsList = HealthyCondition.familyMemberAbusesDrugsList;
    hc.familyMemberNeedsConstantCareList = HealthyCondition.familyMemberNeedsConstantCareList;
    hc.familyMemberUsesControlledMedicationList = HealthyCondition.familyMemberUsesControlledMedicationList;
    hc.hasFamilyIndicatesFoodInsecurity = HealthyCondition.hasFamilyIndicatesFoodInsecurity;
    hc.hasFamilyMemberAbusesAlcohol = HealthyCondition.hasFamilyMemberAbusesAlcohol;
    hc.hasFamilyMemberAbusesDrugs = HealthyCondition.hasFamilyMemberAbusesDrugs;
    hc.hasFamilyMemberNeedsConstantCare = HealthyCondition.hasFamilyMemberNeedsConstantCare;
    hc.hasFamilyMemberUsesControlledMedication = HealthyCondition.hasFamilyMemberUsesControlledMedication;
    hc.hasSevereIllness = HealthyCondition.hasSevereIllness;
    hc.severeIllnessList = HealthyCondition.severeIllnessList;
    hc.updatedAt = HealthyCondition.updatedAt;
    hc.createdAt = HealthyCondition.createdAt;
    hc.save();
    return hc.toObject();
}

export const getHealthConditionDto = async (healthConditionId:string) => {
    const hc = await healthyConditionModel.findById(healthConditionId);
    if(!hc) throw new CustomError('HEALTH_CONDITION_NOT_FOUND',404,'HEALTH_CONDITION_NOT_FOUND','Health Condition not found');
    return hc.toObject();
}

export const createHealthConditionObsertionDto = async (healthConditionId:string,observation:Observations) => {
    const hc = await healthyConditionModel.findById(healthConditionId);
    if(!hc) throw new CustomError('HEALTH_CONDITION_NOT_FOUND',404,'HEALTH_CONDITION_NOT_FOUND','Health Condition not found');
    hc.observations?.push(observation);
    hc.save();
    return hc.toObject();
}