import { Observations } from "./observations.js";

export class FamilyHistoryOfComplianceSocioEducationalMeasures {
    anotationsOfPersons: [string];
    observations?: [Observations];
    isInUse: boolean;

    constructor(anotationsOfPersons:[string],isInUse:boolean) {
        this.anotationsOfPersons = anotationsOfPersons;
        this.isInUse = isInUse;
    }
}