import mongoose from "mongoose";
import { FamilyAndCommunity } from "../../../../domain/entity/familyAndCommunity.js";
import { observation } from "./observationModel.js";

const familyAndCommunityModelScheam = new mongoose.Schema<FamilyAndCommunity>({
    yearsInState:{
        type:Number
    },
    awaysLivingInState:{
        type:Boolean
    },
    yearsInDistrict:{
        type:Number
    },
    awaysLivingInDistrict:{
        type:Boolean
    },
    yearsInNeighborhood:{
        type:Number
    },
    awaysLivingInNeighborhood:{
        type:Boolean
    },
    hasVictimOfThreatsOrDiscrimination:{
        type:Boolean
    },
    hasNearbySupportNetwork:{
        type:Boolean
    },
    hasNeighborSupportNetwork:{
        type:Boolean
    },
    hasParticipatesInSupportGroups:{
        type:Boolean
    },
    hasParticipatesInSocialMovements:{
        type:Boolean
    },
    hasNoAccessToLeisureActivities:{
        type:Boolean
    },
    hasElderWithoutLeisureOrSocialInteraction:{
        type:Boolean
    },
    hasDependentsLeftAloneAtHome:{
        type:Boolean
    },
    relationshipEvaluationByTechnician:{
        type:String,
        enum:['CONFLICT_WITH_VIOLENCE','CONFLICT_WITHOUT_VIOLENCE','WITHOUT_CONFLICT'],
        default:'CONFLICT_WITH_VIOLENCE'
    },
    parentChildRelationshipEvaluation:{
        type:String,
        enum:['CONFLICT_WITH_VIOLENCE','CONFLICT_WITHOUT_VIOLENCE','WITHOUT_CONFLICT'],
        default:'CONFLICT_WITH_VIOLENCE'

    },
    siblingRelationshipEvaluation:{
        type:String,
        enum:['CONFLICT_WITH_VIOLENCE','CONFLICT_WITHOUT_VIOLENCE','WITHOUT_CONFLICT'],
        default:'CONFLICT_WITH_VIOLENCE'
    },
    conflictWithOtherResidents:{
        type:String,
        enum:['CONFLICT_WITH_VIOLENCE','CONFLICT_WITHOUT_VIOLENCE','WITHOUT_CONFLICT'],
        default:'CONFLICT_WITH_VIOLENCE'
    },
    observation:[
        {
            type:observation
        }
    ],
    inInUse:{
        type:Boolean
    }        
})

export const familyAndCommunityModel = mongoose.model<FamilyAndCommunity>('familyAndCommunity',familyAndCommunityModelScheam)