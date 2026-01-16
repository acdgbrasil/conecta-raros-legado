import { Observations } from "./observations.js";

export class FamilySituationViolationStruct{
    thisSituationOcurrent: boolean;
    thisSituationsOcurrentNow: boolean;
    constructor(thisSituationOcurrent: boolean, thisSituationsOcurrentNow: boolean){
        this.thisSituationOcurrent = thisSituationOcurrent;
        this.thisSituationsOcurrentNow = thisSituationsOcurrentNow;
    }
}

export class FamilySituationViolationStructOther{
    thisSituationOcurrent: boolean;
    thisSituationsOcurrentNow: boolean;
    nameOfSituation: string;
    constructor(thisSituationOcurrent: boolean, thisSituationsOcurrentNow: boolean, nameOfSituation: string){
        this.thisSituationOcurrent = thisSituationOcurrent;
        this.thisSituationsOcurrentNow = thisSituationsOcurrentNow;
        this.nameOfSituation = nameOfSituation;
    }
}

export class FamilySituationViolation {
    childLabel: FamilySituationViolationStruct;
    sexualExploitation: FamilySituationViolationStruct;
    sexualAbuse: FamilySituationViolationStruct;
    physicalAbuse: FamilySituationViolationStruct;
    psychologicalAbuse: FamilySituationViolationStruct;
    elderNeglect: FamilySituationViolationStruct;
    childNeglect: FamilySituationViolationStruct;
    pcdNeglect: FamilySituationViolationStruct;
    homelessSituation: FamilySituationViolationStruct;
    humanTrafficking: FamilySituationViolationStruct;
    violenceWithElderOrPcd: FamilySituationViolationStruct;
    other: FamilySituationViolationStructOther;
    isInUse: boolean;
    observations?: Observations[];

    constructor(childLabel: FamilySituationViolationStruct, sexualExploitation: FamilySituationViolationStruct, sexualAbuse: FamilySituationViolationStruct, physicalAbuse: FamilySituationViolationStruct, psychologicalAbuse: FamilySituationViolationStruct, elderNeglect: FamilySituationViolationStruct, childNeglect: FamilySituationViolationStruct, pcdNeglect: FamilySituationViolationStruct, homelessSituation: FamilySituationViolationStruct, humanTrafficking: FamilySituationViolationStruct, violenceWithElderOrPcd: FamilySituationViolationStruct, other: FamilySituationViolationStructOther, isInUse: boolean){
        this.childLabel = childLabel;
        this.sexualExploitation = sexualExploitation;
        this.sexualAbuse = sexualAbuse;
        this.physicalAbuse = physicalAbuse;
        this.psychologicalAbuse = psychologicalAbuse;
        this.elderNeglect = elderNeglect;
        this.childNeglect = childNeglect;
        this.pcdNeglect = pcdNeglect;
        this.homelessSituation = homelessSituation;
        this.humanTrafficking = humanTrafficking;
        this.violenceWithElderOrPcd = violenceWithElderOrPcd;
        this.other = other;
        this.isInUse = isInUse;
    }
}