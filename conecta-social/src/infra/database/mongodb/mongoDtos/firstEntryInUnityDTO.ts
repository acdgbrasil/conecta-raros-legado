import { FirstEntryInUnity } from "../../../../domain/entity/firstEntryInUnity.js";
import { Observations } from "../../../../domain/entity/observations.js";
import { CustomError } from "../../../error/error.js";
import { firstEntryInUnityModel } from "../models/firstEntryInUnityModel.js";

export const createFirstEntryInUnity = async (firstEntry:FirstEntryInUnity,firstEntryInUnityId:string) => {
    try{
        const firstEntryResult = await firstEntryInUnityModel.findOneAndUpdate({_id:firstEntryInUnityId},{
            firstEntryInUnity:firstEntry.firstEntryInUnity,
            motivationForFirstEntry:firstEntry.motivationForFirstEntry,
            nameOfUnityToSendFirstEntry:firstEntry.nameOfUnityToSendFirstEntry,
            ContactEmailOfUnityToSendFirstEntry:firstEntry.ContactEmailOfUnityToSendFirstEntry,
            familyBenefits:firstEntry.familyBenefits,
            isInUse:firstEntry.isInUse,
            updatedAt:Date.now(),
            whoIsResponsibleForFirstEntryId:firstEntry.whoIsResponsibleForFirstEntryId,
        },{new:true});
        if(!firstEntryResult){
            throw new CustomError('FIRST_ENTRY_NOT_FOUND',404,'FIRST_ENTRY_NOT_FOUND','First Entry not found');
        }

        firstEntryResult.save();

        return firstEntryResult.toObject();
    }catch(e){
        throw e;
    }
}

export const getFirstEntryInUnity = async (firstEntryInUnityId:string) => {
    try{
        const firstEntryResult = await firstEntryInUnityModel.findOne({_id:firstEntryInUnityId});
        if(!firstEntryResult){
            throw new CustomError('FIRST_ENTRY_NOT_FOUND',404,'FIRST_ENTRY_NOT_FOUND','First Entry not found');
        }

        return firstEntryResult.toObject();
    }catch(e){
        throw e;
    }
}

export const createFirstEntryInUnityObservation = async (firstEntryInUnityId:string,observation:Observations) => {
    try{
        const firstEntryResult = await firstEntryInUnityModel.findById(firstEntryInUnityId);
        if(!firstEntryResult){
            throw new CustomError('FIRST_ENTRY_NOT_FOUND',404,'FIRST_ENTRY_NOT_FOUND','First Entry not found');
        }
        firstEntryResult.observations?.push(observation);
        firstEntryResult.save();
        return firstEntryResult
        
    }catch(e){
        throw e;
    }
}