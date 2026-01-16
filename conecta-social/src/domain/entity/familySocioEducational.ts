export class HistoricalFamilySocioEducational {
    initDate: Date;
    endDate: Date;
    numberOfProcess: string;
    typeOfMesure: number;
    isInUse: boolean;

    constructor(initDate: Date, endDate: Date, numberOfProcess: string, typeOfMesure: number) {
        this.initDate = initDate;
        this.endDate = endDate;
        this.numberOfProcess = numberOfProcess;
        this.typeOfMesure = typeOfMesure;
        this.isInUse = false;
    }
}