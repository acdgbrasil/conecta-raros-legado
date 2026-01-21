import mongoose from "mongoose";
import { Observations } from "../../../../domain/entity/observations.js";

export const observation = new mongoose.Schema<Observations>({
    observation:{
        required:true,
        type:String
    },
    whoIsObservingId:{
        required:true,
        type:String
    },

    createdAt:{
        type:Date,
        default: Date.now()
    },
    updatedAt:{
        type:Date,
        default: Date.now()
    }
})