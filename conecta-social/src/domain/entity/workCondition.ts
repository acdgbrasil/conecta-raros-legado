export class WorkCondition{
    familyIncome:number;
    perCapitaIncome:number;
    hasSocialIncome:boolean;
    bolsaFamiliaValue:number;
    bpcValue:number;
    petiValue:number;
    othersValue:number;
    bcpBenefitPerson:[string];
    hasRetiredPerson:[string];
    totalFamilyIncome:number;
    totalPerCapitaIncome:number;
    isInUse?:boolean;
    observations?:[string];

    constructor(familyIncome:number, perCapitaIncome:number, hasSocialIncome:boolean, bolsaFamiliaValue:number, bpcValue:number, petiValue:number, othersValue:number, bcpBenefitPerson:[string], hasRetiredPerson:[string], totalFamilyIncome:number, totalPerCapitaIncome:number){
        this.familyIncome = familyIncome;
        this.perCapitaIncome = perCapitaIncome;
        this.hasSocialIncome = hasSocialIncome;
        this.bolsaFamiliaValue = bolsaFamiliaValue;
        this.bpcValue = bpcValue;
        this.petiValue = petiValue;
        this.othersValue = othersValue;
        this.bcpBenefitPerson = bcpBenefitPerson;
        this.hasRetiredPerson = hasRetiredPerson;
        this.totalFamilyIncome = totalFamilyIncome;
        this.totalPerCapitaIncome = totalPerCapitaIncome;
    }

}