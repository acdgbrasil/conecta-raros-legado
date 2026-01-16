import { Observations } from "./observations.js";

export class otherFamilySeparationSituationsStruct {
    hasMemberInPrision:boolean;
    hasMemberInadolescentInSocioEducationalInternment:boolean

    constructor(hasMemberInPrision:boolean,hasMemberInadolescentInSocioEducationalInternment:boolean){
        this.hasMemberInPrision = hasMemberInPrision;
        this.hasMemberInadolescentInSocioEducationalInternment = hasMemberInadolescentInSocioEducationalInternment;
    }
}


export class FamilyHistoryInstitutionalComplet {
    
    familyInstitutionalShelterHistory:string;
    childCustodyHistory:string;
    otherFamilySeparationSituations:otherFamilySeparationSituationsStruct;
    observation?:[Observations];
    isInUse:boolean;
    
    constructor(familyInstitutionalShelterHistory:string,childCustodyHistory:string,otherFamilySeparationSituations:otherFamilySeparationSituationsStruct,isInUse:boolean){
        this.familyInstitutionalShelterHistory = familyInstitutionalShelterHistory;
        this.childCustodyHistory = childCustodyHistory;
        this.otherFamilySeparationSituations = otherFamilySeparationSituations;
        this.isInUse = isInUse
    }

}