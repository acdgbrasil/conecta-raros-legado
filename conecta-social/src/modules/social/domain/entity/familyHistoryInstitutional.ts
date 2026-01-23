export class FamilyHistoryInstitutional {
    initDate: Date;
    endDate: Date;
    reason: string;
    isInUse: boolean;

    constructor(initDate: Date, endDate: Date, reason: string) {
        this.initDate = initDate;
        this.endDate = endDate;
        this.reason = reason;
        this.isInUse = false;
    }

}