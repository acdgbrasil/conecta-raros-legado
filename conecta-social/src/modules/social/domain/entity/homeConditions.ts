import { Observations } from "./observations.js";

export class HomeConditions {
    typeResidence: string;
    materialOfExternalWalls: string;
    hasAcessEnergy: string;
    waterSupply: string;
    sewageDisposal: string;
    garbageCollection: string;
    hasWasteCollection: boolean;
    homeConditionIsInRiskArea: boolean;
    difficultyToAccessHome: boolean;
    hasHomeInsurance: boolean;
    hasHomeInsuranceValue: number;
    numberOfRooms: number;
    numberOfBedrooms: number;
    numberOfPeapleInBedrooms: number;
    observations?: [Observations];
    isInUse?: boolean;
    constructor(
        typeResidence: string,
        materialOfExternalWalls: string,
        hasAcessEnergy: string,
        waterSupply: string,
        sewageDisposal: string,
        garbageCollection: string,
        hasWasteCollection: boolean,
        homeConditionIsInRiskArea: boolean,
        difficultyToAccessHome: boolean,
        hasHomeInsurance: boolean,
        hasHomeInsuranceValue: number,
        numberOfRooms: number,
        numberOfBedrooms: number,
        numberOfPeapleInBedrooms: number,
    ) {
        this.typeResidence = typeResidence;
        this.materialOfExternalWalls = materialOfExternalWalls;
        this.hasAcessEnergy = hasAcessEnergy;
        this.waterSupply = waterSupply;
        this.sewageDisposal = sewageDisposal;
        this.garbageCollection = garbageCollection;
        this.hasWasteCollection = hasWasteCollection;
        this.homeConditionIsInRiskArea = homeConditionIsInRiskArea;
        this.difficultyToAccessHome = difficultyToAccessHome;
        this.hasHomeInsurance = hasHomeInsurance;
        this.hasHomeInsuranceValue = hasHomeInsuranceValue;
        this.numberOfRooms = numberOfRooms;
        this.numberOfBedrooms = numberOfBedrooms;
        this.numberOfPeapleInBedrooms = numberOfPeapleInBedrooms;
    }
}