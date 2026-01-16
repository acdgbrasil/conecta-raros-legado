export class FamilyInstitucionalHistory {
    dateInit: Date;
    dateFinish: Date;
    reason: string;
    inInUse: boolean;

    constructor(dateInit: Date, dateFinish: Date, reason: string, inInUse: boolean){
        this.dateInit = dateInit;
        this.dateFinish = dateFinish;
        this.reason = reason;
        this.inInUse = inInUse;
    }
}