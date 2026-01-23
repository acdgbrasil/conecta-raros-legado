import mongoose from "mongoose";
import { HomeConditions } from "../../../../domain/entity/homeConditions.js";
import { observation } from "./observationModel.js";

const homeConditions = new mongoose.Schema<HomeConditions>({
    typeResidence:{
        type:String,
    },
    materialOfExternalWalls:{
        type:String,
    },
    hasAcessEnergy:{
        type:String,
    },
    waterSupply:{
        type:String,
    },
    sewageDisposal:{
        type:String,
    },
    garbageCollection:{
        type:String,
    },
    hasWasteCollection:{
        type:Boolean,
    },
    homeConditionIsInRiskArea:{
        type:Boolean,
    },
    difficultyToAccessHome:{
        type:Boolean,
    },
    hasHomeInsurance:{
        type:Boolean,
    },
    hasHomeInsuranceValue:{
        type:Number,
    },
    numberOfRooms:{
        type:Number,
    },
    numberOfBedrooms:{
        type:Number,
    },
    numberOfPeapleInBedrooms:{
        type:Number,
    },
    observations:[{
        type:observation
    }],
    isInUse: {
        type: Boolean,
        default: false
    }
});

export const homeConditionsModel = mongoose.model<HomeConditions>('HomeConditions', homeConditions);