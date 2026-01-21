export class FamilyHistorySocioEducation{
    dateInit: Date;
    dateFinish: Date;
    numberOfProcess: string;
    type:number;
    inInUse: boolean;

    constructor(dateInit: Date, dateFinish: Date, numberOfProcess: string, type: number, inInUse: boolean){
        this.dateInit = dateInit;
        this.dateFinish = dateFinish;
        this.numberOfProcess = numberOfProcess;
        this.type = type;
        this.inInUse = inInUse;
    }
}