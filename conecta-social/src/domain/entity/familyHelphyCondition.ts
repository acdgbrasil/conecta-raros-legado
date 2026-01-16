export class HelphyConditionFamily{
    typeOfDeficiency: string;
    helphyNeeds: boolean;
    whoIsResponsibleForHelp: string;
    isInUse: boolean;

    constructor(typeOfDeficiency: string, helphyNeeds: boolean, whoIsResponsibleForHelp: string){
        this.typeOfDeficiency = typeOfDeficiency;
        this.helphyNeeds = helphyNeeds;
        this.whoIsResponsibleForHelp = whoIsResponsibleForHelp;
        this.isInUse = false;
    }
}

