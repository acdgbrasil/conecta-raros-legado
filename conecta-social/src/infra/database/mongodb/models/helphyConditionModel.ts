import mongoose from "mongoose";
import { HelphyCondition, HelphyConditionStruct } from "../../../../domain/entity/healthCondition.js";
import { observation } from "./observationModel.js";

const helphyConditionStructSchema = new mongoose.Schema<HelphyConditionStruct>({
    fullName:{
        type:String,
       
    },
    complement:{
        type:String,
        
    },
})

const helpyConditionSchema = new mongoose.Schema<HelphyCondition>({
    familyMemberAbusesAlcoholList:[
        {
            type:helphyConditionStructSchema,
            
        }
    ],
    familyMemberAbusesDrugsList:[
        {
            type:helphyConditionStructSchema,
            
        }
    ],
    familyMemberNeedsConstantCareList:[
        {
            type:helphyConditionStructSchema,
           
        }
    ],
    familyMemberUsesControlledMedicationList:[
        {
            type:helphyConditionStructSchema,
           
        }
    ],
    hasFamilyIndicatesFoodInsecurity:{
        type:Boolean,
        
    },
    hasFamilyMemberAbusesAlcohol:{
        type:Boolean,
        
    },
    hasFamilyMemberAbusesDrugs:{
        type:Boolean,
       
    },
    hasFamilyMemberNeedsConstantCare:{
        type:Boolean,
       
    },
    hasFamilyMemberUsesControlledMedication:{
        type:Boolean,
        
    },
    hasSevereIllness:{
        type:Boolean,
       
    },
    severeIllnessList:[
        {
            type:helphyConditionStructSchema,
            
        }
    ],
    observations:[
        {type:observation}
    ],
    updatedAt:{
        type:Date,
    },
    createdAt:{
        type:Date,
    }

})

export const helphyConditionModel = mongoose.model('helphyCondition',helpyConditionSchema);