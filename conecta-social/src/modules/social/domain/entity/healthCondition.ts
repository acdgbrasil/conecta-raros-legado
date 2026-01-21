import { Observations } from "./observations.js";

export class HealthyConditionStruct{
    fullName: string;
    complement:string;

    constructor(fullName: string, complement:string){
        this.fullName = fullName;
        this.complement = complement;
    }
}


export class HealthyCondition{
    hasFamilyMemberNeedsConstantCare:boolean;
    familyMemberNeedsConstantCareList: HealthyConditionStruct[];
    hasFamilyIndicatesFoodInsecurity: boolean;
    hasSevereIllness: boolean;
    severeIllnessList: HealthyConditionStruct[];
    hasFamilyMemberUsesControlledMedication: boolean;
    familyMemberUsesControlledMedicationList: HealthyConditionStruct[];
    hasFamilyMemberAbusesAlcohol:boolean;
    familyMemberAbusesAlcoholList: HealthyConditionStruct[];
    hasFamilyMemberAbusesDrugs:boolean;
    familyMemberAbusesDrugsList: HealthyConditionStruct[];
    observations?: Observations[];
    createdAt: Date;
    updatedAt: Date;

    constructor(hasFamilyMemberNeedsConstantCare:boolean, familyMemberNeedsConstantCareList: HealthyConditionStruct[], hasFamilyIndicatesFoodInsecurity: boolean, hasSevereIllness: boolean, severeIllnessList: HealthyConditionStruct[], hasFamilyMemberUsesControlledMedication: boolean, familyMemberUsesControlledMedicationList: HealthyConditionStruct[], hasFamilyMemberAbusesAlcohol:boolean, familyMemberAbusesAlcoholList: HealthyConditionStruct[], hasFamilyMemberAbusesDrugs:boolean, familyMemberAbusesDrugsList: HealthyConditionStruct[], createdAt: Date, updatedAt: Date){
        this.hasFamilyMemberNeedsConstantCare = hasFamilyMemberNeedsConstantCare;
        this.familyMemberNeedsConstantCareList = familyMemberNeedsConstantCareList;
        this.hasFamilyIndicatesFoodInsecurity = hasFamilyIndicatesFoodInsecurity;
        this.hasSevereIllness = hasSevereIllness;
        this.severeIllnessList = severeIllnessList;
        this.hasFamilyMemberUsesControlledMedication = hasFamilyMemberUsesControlledMedication;
        this.familyMemberUsesControlledMedicationList = familyMemberUsesControlledMedicationList;
        this.hasFamilyMemberAbusesAlcohol = hasFamilyMemberAbusesAlcohol;
        this.familyMemberAbusesAlcoholList = familyMemberAbusesAlcoholList;
        this.hasFamilyMemberAbusesDrugs = hasFamilyMemberAbusesDrugs;
        this.familyMemberAbusesDrugsList = familyMemberAbusesDrugsList;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }
    
}