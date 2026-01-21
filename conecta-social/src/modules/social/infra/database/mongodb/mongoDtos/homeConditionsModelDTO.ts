import { HomeConditions } from "../../../../domain/entity/homeConditions.js";
import { Observations } from "../../../../domain/entity/observations.js";
import { homeConditionsModel } from "../models/homeConditionsModel.js";

export const createHomeConditionsdDTO = async (hc:HomeConditions,homeConditionsId:string) => {
    try{
        const homeConditions = await homeConditionsModel.findById(homeConditionsId);
        if(!homeConditions){
            throw new Error('HOME_CONDITIONS_NOT_FOUND');
        }
        homeConditions.typeResidence = hc.typeResidence;
        homeConditions.materialOfExternalWalls = hc.materialOfExternalWalls;
        homeConditions.hasAcessEnergy = hc.hasAcessEnergy;
        homeConditions.waterSupply = hc.waterSupply;
        homeConditions.sewageDisposal = hc.sewageDisposal;
        homeConditions.garbageCollection = hc.garbageCollection;
        homeConditions.hasWasteCollection = hc.hasWasteCollection;
        homeConditions.homeConditionIsInRiskArea = hc.homeConditionIsInRiskArea;
        homeConditions.difficultyToAccessHome = hc.difficultyToAccessHome;
        homeConditions.hasHomeInsurance = hc.hasHomeInsurance;
        homeConditions.hasHomeInsuranceValue = hc.hasHomeInsuranceValue;
        homeConditions.numberOfRooms = hc.numberOfRooms;
        homeConditions.numberOfBedrooms = hc.numberOfBedrooms;
        homeConditions.numberOfPeapleInBedrooms = hc.numberOfPeapleInBedrooms;
        homeConditions.isInUse = true;
        await homeConditions.save();
        return homeConditions.toObject();
    }catch(e){
        throw e;
    }
}


export const createHomeConditionsObservation = async (observation:Observations,homeConditionsId:string) => {
    try{
        const homeConditions = await homeConditionsModel.findById(homeConditionsId);
        if(!homeConditions){
            throw new Error('HOME_CONDITIONS_NOT_FOUND');
        }
        homeConditions.observations?.push(observation);
        await homeConditions.save();
        return homeConditions.toObject();
    }catch(e){
        throw e;
    }
}