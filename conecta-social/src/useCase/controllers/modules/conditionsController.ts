import { HomeConditions } from "../../../domain/entity/homeConditions.js";
import { WorkCondition } from "../../../domain/entity/workCondition.js";
import { WorkConditionPerson, EducationConditionPerson, Pregnant } from "../../../domain/entity/familyComposition.js";
import { HealthyCondition } from "../../../domain/entity/healthCondition.js";
import { HealthyConditionFamily } from "../../../domain/entity/familyHealthyCondition.js";
import { Observations } from "../../../domain/entity/observations.js";
import { DatabaseService } from "../../../infra/database/databaseService.js";
import { FamilyComposition } from "../../../domain/entity/familyComposition.js";

export class ConditionsController {
    private db: DatabaseService;

    constructor() {
        this.db = new DatabaseService();
    }

    // Home
    async createHomeConditions(data: HomeConditions, id: string): Promise<HomeConditions | Error> {
        return this.db.createHomeConditions(data, id);
    }

    async addHomeObservation(obs: Observations, id: string): Promise<HomeConditions | Error> {
        return this.db.createHomeConditionsObservation(obs, id);
    }

    // Work
    async createWorkCondition(
        workCondition: WorkCondition, 
        personWork: WorkConditionPerson, 
        compositionId: string, 
        personId: string, 
        workConditionId: string
    ): Promise<WorkCondition> {
        return this.db.createWorkConditionPerson(workCondition, personWork, compositionId, personId, workConditionId);
    }

    async addWorkObservation(id: string, obs: string): Promise<WorkCondition> {
        return this.db.createWorkConditionObservation(id, obs);
    }

    // Health
    async createHealthCondition(
        health: HealthyCondition, 
        healthId: string, 
        familyHealth: HealthyConditionFamily, 
        compositionId: string, 
        personId: string, 
        pregnant: Pregnant
    ): Promise<HealthyCondition> {
        return this.db.createHealthCondition(health, healthId, familyHealth, compositionId, personId, pregnant);
    }

    async addHealthObservation(id: string, obs: Observations): Promise<HealthyCondition> {
        return this.db.createHealthConditionObservation(id, obs);
    }

    // Education
    async createEducationCondition(
        education: EducationConditionPerson, 
        situationId: string, 
        personId: string
    ): Promise<FamilyComposition> {
        return this.db.createEducationalEspecifications(education, situationId, personId);
    }

    async getSchoolInfo(compositionId: string): Promise<FamilyComposition> {
        return this.db.getInformationOfPersonAndAgeAreInSchool(compositionId);
    }
}