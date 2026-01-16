import mongoose from "mongoose";
import { HealthyCondition, HealthyConditionStruct } from "../../../../domain/entity/healthCondition.js";
import { observation } from "./observationModel.js";

const healthyConditionStructSchema = new mongoose.Schema<HealthyConditionStruct>({
    fullName:{
        type:String,
       
    },
    complement:{
        type:String,
        
    },
})

const healthyConditionSchema = new mongoose.Schema<HealthyCondition>({
    familyMemberAbusesAlcoholList:[
        {
            type:healthyConditionStructSchema,
            
        }
    ],
    familyMemberAbusesDrugsList:[
        {
            type:healthyConditionStructSchema,
            
        }
    ],
    familyMemberNeedsConstantCareList:[
        {
            type:healthyConditionStructSchema,
           
        }
    ],
    familyMemberUsesControlledMedicationList:[
        {
            type:healthyConditionStructSchema,
           
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
            type:healthyConditionStructSchema,
            
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

export const healthyConditionModel = mongoose.model('healthyCondition',healthyConditionSchema);