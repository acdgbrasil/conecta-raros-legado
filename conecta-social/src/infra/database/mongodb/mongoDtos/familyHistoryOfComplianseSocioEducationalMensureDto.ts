import { FamilyHistoryOfComplianceSocioEducationalMeasures } from "../../../../domain/entity/familyHistoryOfComplianceSocioEducationalMeasures.js";
import { Observations } from "../../../../domain/entity/observations.js";
import { CustomError } from "../../../error/error.js";
import { familyHistoryOfComplianceSocioEducationalMeasuresModel } from "../models/familyHistoryOfComplianceSocioEducationalMeasuresModel.js";

export const createAnotationsOfPersons = async (anotationsOfPersons:string,familyHistoryOfComplianseSocioEducationalMensureId:string): Promise<FamilyHistoryOfComplianceSocioEducationalMeasures> => {
    try{
        const familyHistoryOfComplianseSocioEducationalMensure = await familyHistoryOfComplianceSocioEducationalMeasuresModel.findById(familyHistoryOfComplianseSocioEducationalMensureId)
        if(!familyHistoryOfComplianseSocioEducationalMensure){
            throw new CustomError("FAMILY_HISTORY_OF_COMPLIANCE_SOCIO_EDUCATIONAL_MENSURE_NOT_FOUND",404,"Family History Of Compliance Socio Educational Mensure not found","Family History Of Compliance Socio Educational Mensure not found")
        }

        familyHistoryOfComplianseSocioEducationalMensure.anotationsOfPersons.push(anotationsOfPersons);
        familyHistoryOfComplianseSocioEducationalMensure.save();
        return familyHistoryOfComplianseSocioEducationalMensure;

    }catch(err){
        throw err
    }
}

export const createFamilyHistoryOfComplianseSocioEducationalMensureObservation = async (familyHistoryOfComplianseSocioEducationalMensureId:string,observation:Observations): Promise<FamilyHistoryOfComplianceSocioEducationalMeasures> => {
    try{
        const familyHistoryOfComplianseSocioEducationalMensure = await familyHistoryOfComplianceSocioEducationalMeasuresModel.findById(familyHistoryOfComplianseSocioEducationalMensureId)
        if(!familyHistoryOfComplianseSocioEducationalMensure){
            throw new CustomError("FAMILY_HISTORY_OF_COMPLIANCE_SOCIO_EDUCATIONAL_MENSURE_NOT_FOUND",404,"Family History Of Compliance Socio Educational Mensure not found","Family History Of Compliance Socio Educational Mensure not found")
        }

        familyHistoryOfComplianseSocioEducationalMensure.observations?.push(observation);
        familyHistoryOfComplianseSocioEducationalMensure.save();
        return familyHistoryOfComplianseSocioEducationalMensure;

    }catch(err){
        throw err
    }
}