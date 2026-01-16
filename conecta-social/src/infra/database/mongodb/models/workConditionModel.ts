import mongoose from "mongoose";
import { WorkCondition } from "../../../../domain/entity/workCondition.js";

const workConditionSchema = new mongoose.Schema<WorkCondition>({
    familyIncome:{
        type:Number,
    },
    perCapitaIncome:{
        type:Number,
    },
    hasSocialIncome:{
        type:Boolean,
    },
    bolsaFamiliaValue:{
        type:Number,
    },
    bpcValue:{
        type:Number,
    },
    petiValue:{
        type:Number,
    },
    othersValue:{
        type:Number,
    },
    bcpBenefitPerson:{
        type:[String],
    },
    hasRetiredPerson:{
        type:[String],
    },
    totalFamilyIncome:{
        type:Number,
    },
    totalPerCapitaIncome:{
        type:Number,
    },
    isInUse:{
        type:Boolean,
    },
    observations:{
        type:[String],
    }
})

export const WorkConditionModel = mongoose.model<WorkCondition>('workCondition', workConditionSchema);