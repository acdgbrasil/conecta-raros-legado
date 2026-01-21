import { FamilyEventlyBenefits } from "../../../../domain/entity/familyEnvetlyBenefits.js";
import { Observations } from "../../../../domain/entity/observations.js";
import { CustomError } from "../../../error/error.js";
import { familyEventlyBenefitsModel } from "../models/familyEventlyBenefitsModel.js";

export const createFamilyEventlyBenefitsDto = async (familyEventlyBenefits: FamilyEventlyBenefits,familyEventlyBenefitsId:string): Promise<FamilyEventlyBenefits> => {
    const familyBenefitsModel = await  familyEventlyBenefitsModel.findById(familyEventlyBenefitsId);
    if(!familyBenefitsModel) throw new CustomError("FAMILY_EVENTLY_BENEFITS_NOT_FOUND",404,"Family Evently Benefits not found","Family Evently Benefits not found")
    
    familyBenefitsModel.date = familyEventlyBenefits.date;
    familyBenefitsModel.typeOfBenefit = familyEventlyBenefits.typeOfBenefit;
    familyBenefitsModel.numberOfBirthDateOfChildren = familyEventlyBenefits.numberOfBirthDateOfChildren;
    familyBenefitsModel.numberOfCpfDeadPerson = familyEventlyBenefits.numberOfCpfDeadPerson;
    await familyBenefitsModel.save();
    return familyBenefitsModel;

}

export const createFamilyEventlyBenefitsObservationDto = async (familyEventlyBenefitsId:string,observation:Observations): Promise<FamilyEventlyBenefits> => {
    const familyBenefitsModel = await  familyEventlyBenefitsModel.findById(familyEventlyBenefitsId);
    if(!familyBenefitsModel) throw new CustomError("FAMILY_EVENTLY_BENEFITS_NOT_FOUND",404,"Family Evently Benefits not found","Family Evently Benefits not found")
    familyBenefitsModel.observation?.push(observation);
    await familyBenefitsModel.save();
    return familyBenefitsModel;

}
