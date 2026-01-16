import { Observations } from "./observations.js";

export class HelphyConditionStruct{
    fullName: string;
    complement:string;

    constructor(fullName: string, complement:string){
        this.fullName = fullName;
        this.complement = complement;
    }
}


export class HelphyCondition{
    hasFamilyMemberNeedsConstantCare:boolean;
    familyMemberNeedsConstantCareList: HelphyConditionStruct[];
    hasFamilyIndicatesFoodInsecurity: boolean;
    hasSevereIllness: boolean;
    severeIllnessList: HelphyConditionStruct[];
    hasFamilyMemberUsesControlledMedication: boolean;
    familyMemberUsesControlledMedicationList: HelphyConditionStruct[];
    hasFamilyMemberAbusesAlcohol:boolean;
    familyMemberAbusesAlcoholList: HelphyConditionStruct[];
    hasFamilyMemberAbusesDrugs:boolean;
    familyMemberAbusesDrugsList: HelphyConditionStruct[];
    observations?: Observations[];
    createdAt: Date;
    updatedAt: Date;

    constructor(hasFamilyMemberNeedsConstantCare:boolean, familyMemberNeedsConstantCareList: HelphyConditionStruct[], hasFamilyIndicatesFoodInsecurity: boolean, hasSevereIllness: boolean, severeIllnessList: HelphyConditionStruct[], hasFamilyMemberUsesControlledMedication: boolean, familyMemberUsesControlledMedicationList: HelphyConditionStruct[], hasFamilyMemberAbusesAlcohol:boolean, familyMemberAbusesAlcoholList: HelphyConditionStruct[], hasFamilyMemberAbusesDrugs:boolean, familyMemberAbusesDrugsList: HelphyConditionStruct[], createdAt: Date, updatedAt: Date){
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