import mongoose, { Schema } from "mongoose";
import { FirstEntryInUnity } from "../../../../domain/entity/firstEntryInUnity.js";
import { Observations } from "../../../../domain/entity/observations.js";
import { observation } from "./observationModel.js";

const firstEntryInUnity = new mongoose.Schema<FirstEntryInUnity>({
   firstEntryInUnity: {
        type: String
    },
    motivationForFirstEntry: {
        type: String
    },
    nameOfUnityToSendFirstEntry: {
        type: String
    },
    ContactEmailOfUnityToSendFirstEntry: {
        type: String
    },
    familyBenefits: {
        type: String
    },
    isInUse: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    observations:[{
        type:observation
    }],
})

export const firstEntryInUnityModel = mongoose.model('firstEntryInUnity',firstEntryInUnity);