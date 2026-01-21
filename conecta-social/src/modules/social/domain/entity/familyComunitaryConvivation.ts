export class FamilyComunitaryConvivation{
    dateOfInit: Date;
    dateOfFinish: Date;
    unity: number;
    serviceType: number;
    isInUse: boolean;

    constructor(dateOfInit: Date, dateOfFinish: Date, unity: number, serviceType: number){
        this.dateOfInit = dateOfInit;
        this.dateOfFinish = dateOfFinish;
        this.unity = unity;
        this.serviceType = serviceType;
        this.isInUse = false;
    }
}