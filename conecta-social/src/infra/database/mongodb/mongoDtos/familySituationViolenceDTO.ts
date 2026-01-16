
import { FamilySituationViolation } from "../../../../domain/entity/familySituationViolation.js"
import { Observations } from "../../../../domain/entity/observations.js"
import { CustomError } from "../../../error/error.js"
import { familySituationViolenceModel } from "../models/familySituationViolenceModel.js"

export const familySituationViolenceDTO = async (familySituationViolationId:string,familySituationViolation:FamilySituationViolation) => {
    const familySituationViolence = await familySituationViolenceModel.findById(familySituationViolationId)
    if(!familySituationViolence) throw new CustomError("FAMILY_SITUATION_NOT_FOUND",404,"Family Situation Violation not found","Family Situation Violation not found")
    familySituationViolence.childLabel.thisSituationOcurrent = familySituationViolation.childLabel.thisSituationOcurrent
    familySituationViolence.childLabel.thisSituationsOcurrentNow = familySituationViolation.childLabel.thisSituationsOcurrentNow
    familySituationViolence.sexualExploitation.thisSituationOcurrent = familySituationViolation.sexualExploitation.thisSituationOcurrent
    familySituationViolence.sexualExploitation.thisSituationsOcurrentNow = familySituationViolation.sexualExploitation.thisSituationsOcurrentNow
    familySituationViolence.sexualAbuse.thisSituationOcurrent = familySituationViolation.sexualAbuse.thisSituationOcurrent
    familySituationViolence.sexualAbuse.thisSituationsOcurrentNow = familySituationViolation.sexualAbuse.thisSituationsOcurrentNow
    familySituationViolence.physicalAbuse.thisSituationOcurrent = familySituationViolation.physicalAbuse.thisSituationOcurrent
    familySituationViolence.physicalAbuse.thisSituationsOcurrentNow = familySituationViolation.physicalAbuse.thisSituationsOcurrentNow
    familySituationViolence.psychologicalAbuse.thisSituationOcurrent = familySituationViolation.psychologicalAbuse.thisSituationOcurrent
    familySituationViolence.psychologicalAbuse.thisSituationsOcurrentNow = familySituationViolation.psychologicalAbuse.thisSituationsOcurrentNow
    familySituationViolence.elderNeglect.thisSituationOcurrent = familySituationViolation.elderNeglect.thisSituationOcurrent
    familySituationViolence.elderNeglect.thisSituationsOcurrentNow = familySituationViolation.elderNeglect.thisSituationsOcurrentNow
    familySituationViolence.childNeglect.thisSituationOcurrent = familySituationViolation.childNeglect.thisSituationOcurrent
    familySituationViolence.childNeglect.thisSituationsOcurrentNow = familySituationViolation.childNeglect.thisSituationsOcurrentNow
    familySituationViolence.pcdNeglect.thisSituationOcurrent = familySituationViolation.pcdNeglect.thisSituationOcurrent
    familySituationViolence.pcdNeglect.thisSituationsOcurrentNow = familySituationViolation.pcdNeglect.thisSituationsOcurrentNow
    familySituationViolence.homelessSituation.thisSituationOcurrent = familySituationViolation.homelessSituation.thisSituationOcurrent
    familySituationViolence.homelessSituation.thisSituationsOcurrentNow = familySituationViolation.homelessSituation.thisSituationsOcurrentNow
    familySituationViolence.humanTrafficking.thisSituationOcurrent = familySituationViolation.humanTrafficking.thisSituationOcurrent
    familySituationViolence.humanTrafficking.thisSituationsOcurrentNow = familySituationViolation.humanTrafficking.thisSituationsOcurrentNow
    familySituationViolence.violenceWithElderOrPcd.thisSituationOcurrent = familySituationViolation.violenceWithElderOrPcd.thisSituationOcurrent
    familySituationViolence.violenceWithElderOrPcd.thisSituationsOcurrentNow = familySituationViolation.violenceWithElderOrPcd.thisSituationsOcurrentNow
    familySituationViolence.other.thisSituationOcurrent = familySituationViolation.other.thisSituationOcurrent
    familySituationViolence.other.thisSituationsOcurrentNow = familySituationViolation.other.thisSituationsOcurrentNow
    familySituationViolence.other.nameOfSituation = familySituationViolation.other.nameOfSituation
    await familySituationViolence.save()
    return familySituationViolence
}

export const familySituationViolenceObservation = async (familySituationViolationId: string,observation: Observations):Promise<FamilySituationViolation> => {
    try{
        const familySituationViolence = await familySituationViolenceModel.findById(familySituationViolationId)
        if(!familySituationViolence) throw new CustomError("FAMILY_SITUATION_NOT_FOUND",404,"Family Situation Violation not found","Family Situation Violation not found")
        familySituationViolence.observations?.push(observation)
        await familySituationViolence.save()
        return familySituationViolence
    }catch(e){
        throw e;
    }
}