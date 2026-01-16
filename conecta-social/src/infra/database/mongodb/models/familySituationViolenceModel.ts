import mongoose from "mongoose";
import { FamilySituationViolation, FamilySituationViolationStruct, FamilySituationViolationStructOther } from "../../../../domain/entity/familySituationViolation.js";
import { observation } from "./observationModel.js";

const familySituationViolationStruct = new mongoose.Schema<FamilySituationViolationStruct>({
    thisSituationOcurrent: {
        type: Boolean,
    },
    thisSituationsOcurrentNow: {
        type: Boolean,
    },
})

const familySituationViolationStructOther = new mongoose.Schema<FamilySituationViolationStructOther>({
    thisSituationOcurrent: {
        type: Boolean,
    },
    thisSituationsOcurrentNow: {
        type: Boolean,
    },
    nameOfSituation: {
        type: String,
    }
})

const familySituationViolation = new mongoose.Schema<FamilySituationViolation>({
    childLabel: familySituationViolationStruct,
    sexualExploitation: familySituationViolationStruct,
    sexualAbuse: familySituationViolationStruct,
    physicalAbuse: familySituationViolationStruct,
    psychologicalAbuse: familySituationViolationStruct,
    elderNeglect: familySituationViolationStruct,
    childNeglect: familySituationViolationStruct,
    pcdNeglect: familySituationViolationStruct,
    homelessSituation: familySituationViolationStruct,
    humanTrafficking: familySituationViolationStruct,
    violenceWithElderOrPcd: familySituationViolationStruct,
    other: familySituationViolationStructOther,
    isInUse: {
        type: Boolean,
    },
    observations: [
        {
            type: observation
        }
    ]
})

export const familySituationViolenceModel = mongoose.model('FamilySituationViolence', familySituationViolation);