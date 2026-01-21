import mongoose from "mongoose";
import { FamilyEventlyBenefits } from "../../../../domain/entity/familyEnvetlyBenefits.js";
import { observation } from "./observationModel.js";

const familyEventlyBenefitsSchema = new mongoose.Schema<FamilyEventlyBenefits>({
    date:{
        type:Date
    },
    numberOfBirthDateOfChildren:{
        type:String
    },
    numberOfCpfDeadPerson:{
        type:String
    },
    typeOfBenefit:{
        type:Number
    },
    inInUse:{
        type:Boolean
    },
    observation:[
        {
            type:observation
        }
    ]
})

export const familyEventlyBenefitsModel = mongoose.model('familyEventlyBenefits',familyEventlyBenefitsSchema);