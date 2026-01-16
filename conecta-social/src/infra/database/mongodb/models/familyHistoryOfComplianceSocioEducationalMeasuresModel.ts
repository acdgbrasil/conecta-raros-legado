import mongoose from "mongoose";
import { FamilyHistoryOfComplianceSocioEducationalMeasures } from "../../../../domain/entity/familyHistoryOfComplianceSocioEducationalMeasures.js";
import { observation } from "./observationModel.js";

const familyHistoryOfComplianceSocioEducationalMeasuresSchema = new mongoose.Schema<FamilyHistoryOfComplianceSocioEducationalMeasures>({
    anotationsOfPersons:{
        type:[String]
    },
    isInUse:{
        type:Boolean
    },
    observations:[{
        type:observation
    }]
})

export const familyHistoryOfComplianceSocioEducationalMeasuresModel = mongoose.model('familyHistoryOfComplianceSocioEducationalMeasures',familyHistoryOfComplianceSocioEducationalMeasuresSchema);
