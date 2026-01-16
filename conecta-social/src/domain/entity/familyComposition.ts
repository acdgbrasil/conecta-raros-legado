import { FamilyComunitaryConvivation } from "./familyComunitaryConvivation.js";
import { HelphyConditionFamily } from "./familyHelphyCondition.js";
import { FamilyHistorySocioEducation } from "./familyHistorySocioEducation.js";
import { FamilyInstitucionalHistory } from "./familyInstitucionalHistory.js";
import { Observations } from "./observations.js";

export class Documents{
    cn: boolean;
    rg: boolean;
    ctps: boolean;
    cpf: boolean;
    te: boolean;

    constructor(cn:boolean, rg:boolean, ctps:boolean, cpf:boolean, te:boolean){
        this.cn = cn;
        this.rg = rg;
        this.ctps = ctps;
        this.cpf = cpf;
        this.te = te;
    }    
}

export class ParticipationAndSocialServices{
    isInUser: boolean;
    serviceProgramOrProject: string;
    unityRealization: string;
    dateRealization: Date;
    dateConclusion: Date;

    constructor(isInUser:boolean, serviceProgramOrProject:string, unityRealization:string, dateRealization:Date, dateConclusion:Date){
        this.isInUser = isInUser;
        this.serviceProgramOrProject = serviceProgramOrProject;
        this.unityRealization = unityRealization;
        this.dateRealization = dateRealization;
        this.dateConclusion = dateConclusion;
    }
}

export class Pregnant{
    pregnancyMonths: number;
    hasPreNatal: boolean;
    isInUse: boolean;

    constructor(pregnancyMonths:number, hasPreNatal:boolean, isInUse:boolean){
        this.pregnancyMonths = pregnancyMonths;
        this.hasPreNatal = hasPreNatal;
        this.isInUse = isInUse;
    }
}

export class OcurruncyBolsaFamilia{
    ocurruncyDate: Date;
    efect:number;
    suspensionSolicitation: boolean;

    constructor(ocurruncyDate:Date, efect:number, suspensionSolicitation:boolean){
        this.ocurruncyDate = ocurruncyDate;
        this.efect = efect;
        this.suspensionSolicitation = suspensionSolicitation;
    }
}

export class EducationConditionPerson{
    isInUse: boolean;
    literate: boolean;
    schoolShip: number;
    isStudying:boolean;
    ocorruncyBolsaFamilia:OcurruncyBolsaFamilia;

    constructor(isInUse:boolean, literate:boolean, schoolShip:number, isStudying:boolean, ocorruncyBolsaFamilia:OcurruncyBolsaFamilia){
        this.isInUse = isInUse;
        this.literate = literate;
        this.schoolShip = schoolShip;
        this.isStudying = isStudying;
        this.ocorruncyBolsaFamilia = ocorruncyBolsaFamilia;
    }

}

export class WorkConditionPerson{
    isInUse: boolean;
    workCondition: string;
    hasWorkCard: boolean;
    workQualification: string;
    workValue: number;

    constructor(isInUse:boolean, workCondition:string, hasWorkCard:boolean, workQualification:string, workValue:number){
        this.isInUse = isInUse;
        this.workCondition = workCondition;
        this.hasWorkCard = hasWorkCard;
        this.workQualification = workQualification;
        this.workValue = workValue;
    }

}

export class FamilyCompositionPerson{
    fullName: string;
    birthDate: Date;
    biologicalGender: string;
    personWithDisability: boolean;
    documents: Documents;
    kinship: number;
    educationConditionPerson?: EducationConditionPerson;
    workConditionPerson?: WorkConditionPerson;
    pregnant?:Pregnant;
    participationAndSocialServices?:ParticipationAndSocialServices;
    helphyConditionFamily?:HelphyConditionFamily;
    familyComunitaryConvivation?:FamilyComunitaryConvivation;
    familyHistorySocioEducation?:FamilyHistorySocioEducation;
    familyInstitutionalHistory?:FamilyInstitucionalHistory;
    historySocialLaOrPSC?:Boolean;
    
    constructor(fullName:string, birthDate:Date, biologicalGender:string, personWithDisability:boolean, documents:Documents, kinship:number){
        this.fullName = fullName;
        this.birthDate = birthDate;
        this.biologicalGender = biologicalGender;
        this.personWithDisability = personWithDisability;
        this.documents = documents;
        this.kinship = kinship;
    }
}
export class FamilyComposition{
    socialEspecification: string;
    familyCompositionPerson: FamilyCompositionPerson[];
    espeficationEthnicity: string;
    observation: Observations[];
    isInUse: boolean;

    constructor(socialEspecification:string, familyCompositionPerson:FamilyCompositionPerson[], espeficationEthnicity:string,observation:Observations[],isInUse:boolean){
        this.socialEspecification = socialEspecification;
        this.familyCompositionPerson = familyCompositionPerson;
        this.espeficationEthnicity = espeficationEthnicity;
        this.observation = observation;
        this.isInUse = isInUse;
    }
}