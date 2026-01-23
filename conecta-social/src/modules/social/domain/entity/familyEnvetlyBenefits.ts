import { Observations } from "./observations.js";

export class FamilyEventlyBenefits {
  date:Date;
  typeOfBenefit:number;
  numberOfBirthDateOfChildren:string;
  numberOfCpfDeadPerson:string;
  inInUse:boolean;
  observation?:Observations[]

    constructor(date:Date, typeOfBenefit:number, numberOfBirthDateOfChildren:string, numberOfCpfDeadPerson:string,inInUse:boolean){
        this.date = date;
        this.typeOfBenefit = typeOfBenefit;
        this.numberOfBirthDateOfChildren = numberOfBirthDateOfChildren;
        this.numberOfCpfDeadPerson = numberOfCpfDeadPerson;
        this.inInUse = inInUse;
    }
}