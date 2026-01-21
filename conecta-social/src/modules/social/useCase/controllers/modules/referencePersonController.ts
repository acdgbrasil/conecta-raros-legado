import { ReferencePerson } from "../../../domain/entity/referencePerson.js";
import { Observations } from "../../../domain/entity/observations.js";
import { DatabaseService } from "../../../infra/database/databaseService.js";

export class ReferencePersonController {
    private db: DatabaseService;

    constructor() {
        this.db = new DatabaseService();
    }

    async create(referencePerson: ReferencePerson): Promise<ReferencePerson | Error> {
        return this.db.createReferencePerson(referencePerson);
    }

    async listAll(): Promise<ReferencePerson[]> {
        return this.db.listAllReferencePerson();
    }

    async getById(id: string): Promise<ReferencePerson | Error> {
        return this.db.getByIdReferencePerson(id);
    }

    async getWithObservations(id: string): Promise<ReferencePerson | Error> {
        return this.db.getReferencePersonWithObservations(id);
    }

    async addObservation(observation: Observations, referencePersonId: string): Promise<Observations | Error> {
        return this.db.createReferencePersonObservation(observation, referencePersonId);
    }
}
