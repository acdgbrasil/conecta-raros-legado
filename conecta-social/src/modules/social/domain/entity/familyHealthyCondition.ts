export class HealthyConditionFamily{
    typeOfDeficiency: string;
    healthyNeeds: boolean;
    whoIsResponsibleForHelp: string;
    isInUse: boolean;

    constructor(typeOfDeficiency: string, healthyNeeds: boolean, whoIsResponsibleForHelp: string){
        this.typeOfDeficiency = typeOfDeficiency;
        this.healthyNeeds = healthyNeeds;
        this.whoIsResponsibleForHelp = whoIsResponsibleForHelp;
        this.isInUse = false;
    }
}