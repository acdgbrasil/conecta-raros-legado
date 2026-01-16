import { FamilySituationViolation } from "../../../domain/entity/familySituationViolation.js";
import { FamilyHistorySocioEducation } from "../../../domain/entity/familyHistorySocioEducation.js";
import { FamilyHistoryOfComplianceSocioEducationalMeasures } from "../../../domain/entity/familyHistoryOfComplianceSocioEducationalMeasures.js";
import { FamilyHistoryInstitutionalComplet } from "../../../domain/entity/familyHistoryInstitutionalComplet.js";
import { FamilyInstitucionalHistory } from "../../../domain/entity/familyInstitucionalHistory.js";
import { Observations } from "../../../domain/entity/observations.js";
import { DatabaseService } from "../../../infra/database/databaseService.js";

export class SocialRiskController {
    private db: DatabaseService;

    constructor() {
        this.db = new DatabaseService();
    }

    // Violence
    async createViolenceSituation(data: FamilySituationViolation, id: string): Promise<FamilySituationViolation> {
        return this.db.createSituationViolation(data, id);
    }

    async addViolenceObservation(id: string, obs: Observations): Promise<FamilySituationViolation> {
        return this.db.createSituationViolationObservation(id, obs);
    }

    // Socio-Educational Measures
    async createSocioEducational(
        laOrPsc: boolean, 
        measureId: string, 
        history: FamilyHistorySocioEducation, 
        compositionId: string, 
        personId: string, 
        annotations: string
    ): Promise<FamilyHistoryOfComplianceSocioEducationalMeasures> {
        return this.db.createFamilyHistoryOfComplianseSocioEducationalMensure(
            laOrPsc, measureId, history, compositionId, personId, annotations
        );
    }

    async addSocioEducationalObservation(id: string, obs: Observations): Promise<FamilyHistoryOfComplianceSocioEducationalMeasures> {
        return this.db.createFamilyHistoryOfComplianseSocioEducationalMensureObservation(id, obs);
    }

    // Institutional History
    async createInstitutionalHistory(
        complet: FamilyHistoryInstitutionalComplet, 
        completId: string, 
        personHistory: FamilyInstitucionalHistory, 
        compositionId: string, 
        personId: string
    ): Promise<FamilyHistoryInstitutionalComplet> {
        return this.db.createFamilyHistoryInstitutionalComplets(
            complet, completId, personHistory, compositionId, personId
        );
    }

    async addInstitutionalObservation(id: string, obs: Observations): Promise<FamilyHistoryInstitutionalComplet> {
        return this.db.createFamilyHistoryInstitutionalCompletObservation(id, obs);
    }
}
