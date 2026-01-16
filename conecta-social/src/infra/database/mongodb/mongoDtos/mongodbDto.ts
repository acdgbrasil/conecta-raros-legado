import mongoose from "mongoose";
import { MongooseClientSingleton } from "../mongooseClientSingleton.js";
import { CodeModel } from "../mongoModels.js";
import { config } from 'dotenv';
config();

export const connectionMongose = async () => {
    try {

        if(process.env.MONGO_LOCAL_URL == null || process.env.MONGO_LOCAL_URL == undefined || process.env.MONGO_LOCAL_URL == ''){
            console.log('FAIL TO LOAD MONGO_LOCAL_URL');
            throw new Error('FAIL TO LOAD MONGO_LOCAL_URL');
        }

        const client = await mongoose.connect(process.env.MONGO_LOCAL_URL);
        return client;
    } catch (error) {
        console.log('Error to connect MongoDB', error);
    }
}


export const testConnection = () => {
    const client:mongoose.Mongoose = MongooseClientSingleton.getInstance;
    if(client && client.connection.readyState === 1){
        console.log('Mongose is connected');
    }
}

export const createCode = async (code:string) => {
    try{
        const expiredCode = CodeModel.create({code:code});
        return expiredCode;
    }catch(error){
        throw new Error('Error to create code');
    }
}

export const findCode = async (code:string) => {
    try{
        const expiredCode = await CodeModel.findOne({
            code:code
        });
        return expiredCode;
    }catch(error){
        throw new Error('Error to find code');
    }
}


export const deleteCode = async (code:string) => {
    try{
        const expiredCode = await CodeModel.deleteOne({
            code:code
        });
        return expiredCode;
    }catch(error){
        throw new Error('Error to delete code');
    }
}