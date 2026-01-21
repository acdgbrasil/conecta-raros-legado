import mongoose from "mongoose";
import { MongooseClientSingleton } from "./mongooseClientSingleton.js";

//const client:mongoose.Mongoose = MongooseClientSingleton.getInstance;
export const FIVE_MINUTES = (60 * 15)*5;
const codeSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true
    },
    createdAt: { 
        type: Date, 
        default: Date.now 
    },
    expireAt: {
        type: Date,
        expires: FIVE_MINUTES,
        default: Date.now
    }
});

codeSchema.index({ createdAt: 1 }, { expireAfterSeconds: FIVE_MINUTES });

export const CodeModel = mongoose.model('Code', codeSchema);
