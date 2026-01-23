import { FamilyAndCommunity } from "../../../domain/entity/familyAndCommunity.js";
import { FamilyCompositionPerson, Documents, EducationConditionPerson, Pregnant } from "../../../domain/entity/familyComposition.js";
import { FamilyComunitaryConvivation } from "../../../domain/entity/familyComunitaryConvivation.js";
import { FamilyEventlyBenefits } from "../../../domain/entity/familyEnvetlyBenefits.js";
import { Observations } from "../../../domain/entity/observations.js";
import { DatabaseService } from "../../../infra/database/databaseService.js";
import { FamilyComposition } from "../../../domain/entity/familyComposition.js";

export class FamilyController {
    private db: DatabaseService;

    constructor() {
        this.db = new DatabaseService();
    }

    async createFamilyPerson(person: FamilyCompositionPerson, familyCompositionID: string): Promise<FamilyComposition | Error> {
        return this.db.createFamilyPerson(person, familyCompositionID);
    }

    async addObservation(observation: Observations, familyCompositionID: string): Promise<FamilyComposition | Error> {
        return this.db.createFamilyCompositionObservation(observation, familyCompositionID);
    }

    async createDocuments(documents: Documents, familyCompositionID: string, personId: string): Promise<FamilyComposition | Error> {
        return this.db.createDocuments(documents, familyCompositionID, personId);
    }

    async createEtnicalSpecifications(spec: string, familyCompositionID: string): Promise<FamilyComposition | Error> {
        return this.db.createEtnicalEspecifications(spec, familyCompositionID);
    }

    async createSocialSpecifications(spec: string, familyCompositionID: string): Promise<FamilyComposition | Error> {
        return this.db.createSocialEspecifications(spec, familyCompositionID);
    }

    // Family and Community
    async createFamilyAndCommunity(data: FamilyAndCommunity, id: string): Promise<FamilyAndCommunity> {
        return this.db.createFamilyAndCommunity(data, id);
    }

    async addFamilyAndCommunityObservation(id: string, obs: Observations): Promise<FamilyAndCommunity> {
        return this.db.createFamilyAndCommunityObservation(id, obs);
    }

    // Community Convivation
    async createComunitaryConvivation(data: FamilyComunitaryConvivation, compositionId: string, personId: string): Promise<FamilyComposition> {
        return this.db.createFamilyComunitaryConvivationPerson(data, compositionId, personId);
    }

    // Benefits
    async createBenefits(data: FamilyEventlyBenefits, id: string): Promise<FamilyEventlyBenefits> {
        return this.db.createFamilyEventlyBenefits(data, id);
    }

    async getFamilyCompositionPersons(id: string): Promise<FamilyCompositionPerson[]> {
        return this.db.getFamilyCompositonPersons(id);
    }
}
