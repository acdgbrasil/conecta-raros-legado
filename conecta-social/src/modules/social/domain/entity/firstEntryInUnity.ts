import { Observations } from "./observations.js";

export class FirstEntryInUnity{
    firstEntryInUnity: string;
    motivationForFirstEntry: string;
    nameOfUnityToSendFirstEntry?: string;
    ContactEmailOfUnityToSendFirstEntry?: string;
    familyBenefits: string;
    isInUse: boolean;
    observations?:[Observations]
    createdAt: Date;
    updatedAt: Date;
    whoIsResponsibleForFirstEntryId: string;
    constructor(firstEntryInUnity: string, motivationForFirstEntry: string, familyBenefits: string, isInUse: boolean, createdAt: Date, updatedAt: Date, whoIsResponsibleForFirstEntryId: string, nameOfUnityToSendFirstEntry?: string, ContactEmailOfUnityToSendFirstEntry?: string){
        this.firstEntryInUnity = firstEntryInUnity;
        this.motivationForFirstEntry = motivationForFirstEntry;
        this.nameOfUnityToSendFirstEntry = nameOfUnityToSendFirstEntry;
        this.ContactEmailOfUnityToSendFirstEntry = ContactEmailOfUnityToSendFirstEntry;
        this.familyBenefits = familyBenefits;
        this.isInUse = isInUse;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.whoIsResponsibleForFirstEntryId = whoIsResponsibleForFirstEntryId;
    }

}