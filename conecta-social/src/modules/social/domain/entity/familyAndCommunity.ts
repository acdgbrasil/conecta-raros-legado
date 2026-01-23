import { Observations } from "./observations.js";

enum FamilyAndCommunityEnum {
    CONFLICT_WITH_VIOLENCE,
    CONFLICT_WITHOUT_VIOLENCE,
    WITHOUT_CONFLICT
}

export class FamilyAndCommunity{
    yearsInState?: number;
    awaysLivingInState?: boolean;
    yearsInDistrict?: number;
    awaysLivingInDistrict?: boolean;
    yearsInNeighborhood?: number;
    awaysLivingInNeighborhood?: boolean;
    hasVictimOfThreatsOrDiscrimination?: boolean;
    hasNearbySupportNetwork?: boolean;
    hasNeighborSupportNetwork?: boolean;
    hasParticipatesInSupportGroups?: boolean;
    hasParticipatesInSocialMovements?: boolean;
    hasNoAccessToLeisureActivities?: boolean;
    hasElderWithoutLeisureOrSocialInteraction?: boolean;
    hasDependentsLeftAloneAtHome?: boolean;
    relationshipEvaluationByTechnician?: string;
    parentChildRelationshipEvaluation?: string;
    siblingRelationshipEvaluation?: string;
    conflictWithOtherResidents?: string;
    observation?: Observations;
    inInUse?: boolean;

    constructor(
        yearsInState?: number,
        awaysLivingInState?: boolean,
        yearsInDistrict?: number,
        awaysLivingInDistrict?: boolean,
        yearsInNeighborhood?: number,
        awaysLivingInNeighborhood?: boolean,
        hasVictimOfThreatsOrDiscrimination?: boolean,
        hasNearbySupportNetwork?: boolean,
        hasNeighborSupportNetwork?: boolean,
        hasParticipatesInSupportGroups?: boolean,
        hasParticipatesInSocialMovements?: boolean,
        hasNoAccessToLeisureActivities?: boolean,
        hasElderWithoutLeisureOrSocialInteraction?: boolean,
        hasDependentsLeftAloneAtHome?: boolean,
        relationshipEvaluationByTechnician?: string,
        parentChildRelationshipEvaluation?: string,
        siblingRelationshipEvaluation?: string,
        conflictWithOtherResidents?: string,
        inInUse?: boolean
    ){
        this.yearsInState = yearsInState;
        this.awaysLivingInState = awaysLivingInState;
        this.yearsInDistrict = yearsInDistrict;
        this.awaysLivingInDistrict = awaysLivingInDistrict;
        this.yearsInNeighborhood = yearsInNeighborhood;
        this.awaysLivingInNeighborhood = awaysLivingInNeighborhood;
        this.hasVictimOfThreatsOrDiscrimination = hasVictimOfThreatsOrDiscrimination;
        this.hasNearbySupportNetwork = hasNearbySupportNetwork;
        this.hasNeighborSupportNetwork = hasNeighborSupportNetwork;
        this.hasParticipatesInSupportGroups = hasParticipatesInSupportGroups;
        this.hasParticipatesInSocialMovements = hasParticipatesInSocialMovements;
        this.hasNoAccessToLeisureActivities = hasNoAccessToLeisureActivities;
        this.hasElderWithoutLeisureOrSocialInteraction = hasElderWithoutLeisureOrSocialInteraction;
        this.hasDependentsLeftAloneAtHome = hasDependentsLeftAloneAtHome;
        this.relationshipEvaluationByTechnician = relationshipEvaluationByTechnician;
        this.parentChildRelationshipEvaluation = parentChildRelationshipEvaluation;
        this.siblingRelationshipEvaluation = siblingRelationshipEvaluation;
        this.conflictWithOtherResidents = conflictWithOtherResidents;
        this.inInUse = inInUse;
    }
    
}