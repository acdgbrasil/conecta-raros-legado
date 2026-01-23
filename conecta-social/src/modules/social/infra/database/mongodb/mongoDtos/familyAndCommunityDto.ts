import { FamilyAndCommunity } from "../../../../domain/entity/familyAndCommunity.js";
import { Observations } from "../../../../domain/entity/observations.js";
import { CustomError } from "../../../error/error.js";
import { familyAndCommunityModel } from "../models/familyAndCommunityModel.js";
import { observation } from "../models/observationModel.js";

export const createFamilyAndCommunityDto = async (familyAndCommunity: FamilyAndCommunity, familyAndCommunityId: string): Promise<FamilyAndCommunity> => {
    const fc = await familyAndCommunityModel.findById(familyAndCommunityId);
    if(!fc) throw new CustomError('FAMILY_AND_COMMUNITY_NOT_FOUND', 404, 'Family and Community not found', 'Family and Community not found');
    fc.yearsInState = familyAndCommunity.yearsInState;
    fc.awaysLivingInState = familyAndCommunity.awaysLivingInState;
    fc.yearsInDistrict = familyAndCommunity.yearsInDistrict;
    fc.awaysLivingInDistrict = familyAndCommunity.awaysLivingInDistrict;
    fc.yearsInNeighborhood = familyAndCommunity.yearsInNeighborhood;
    fc.awaysLivingInNeighborhood = familyAndCommunity.awaysLivingInNeighborhood;
    fc.hasVictimOfThreatsOrDiscrimination = familyAndCommunity.hasVictimOfThreatsOrDiscrimination;
    fc.hasNearbySupportNetwork = familyAndCommunity.hasNearbySupportNetwork;
    fc.hasNeighborSupportNetwork = familyAndCommunity.hasNeighborSupportNetwork;
    fc.hasParticipatesInSupportGroups = familyAndCommunity.hasParticipatesInSupportGroups;
    fc.hasParticipatesInSocialMovements = familyAndCommunity.hasParticipatesInSocialMovements;
    fc.hasNoAccessToLeisureActivities = familyAndCommunity.hasNoAccessToLeisureActivities;
    fc.hasElderWithoutLeisureOrSocialInteraction = familyAndCommunity.hasElderWithoutLeisureOrSocialInteraction;
    fc.hasDependentsLeftAloneAtHome = familyAndCommunity.hasDependentsLeftAloneAtHome;
    fc.relationshipEvaluationByTechnician = familyAndCommunity.relationshipEvaluationByTechnician;
    fc.parentChildRelationshipEvaluation = familyAndCommunity.parentChildRelationshipEvaluation;
    fc.siblingRelationshipEvaluation = familyAndCommunity.siblingRelationshipEvaluation;
    fc.conflictWithOtherResidents = familyAndCommunity.conflictWithOtherResidents;
    await fc.save();
    return fc;
};

export const createFamilyAndCommunityObservationDto = async (familyAndCommunityId: string, observation: Observations): Promise<FamilyAndCommunity> => {
    const fc = await familyAndCommunityModel.findById(familyAndCommunityId);
    if(!fc) throw new CustomError('FAMILY_AND_COMMUNITY_NOT_FOUND', 404, 'Family and Community not found', 'Family and Community not found');
    fc.observation = observation;
    await fc.save();
    return fc;
}
