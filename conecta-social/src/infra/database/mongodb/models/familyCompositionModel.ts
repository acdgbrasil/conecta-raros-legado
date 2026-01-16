import mongoose from "mongoose";
import { Documents, EducationConditionPerson, FamilyComposition, FamilyCompositionPerson, OcurruncyBolsaFamilia, ParticipationAndSocialServices, Pregnant, WorkConditionPerson } from "../../../../domain/entity/familyComposition.js";
import { observation } from "./observationModel.js";
import { HelphyConditionFamily } from "../../../../domain/entity/familyHelphyCondition.js";
import { FamilyComunitaryConvivation } from "../../../../domain/entity/familyComunitaryConvivation.js";
import { FamilyHistorySocioEducation } from "../../../../domain/entity/familyHistorySocioEducation.js";
import { FamilyInstitucionalHistory } from "../../../../domain/entity/familyInstitucionalHistory.js";

const documents = new mongoose.Schema<Documents>({
    cn:{
        type:Boolean,
    },
    rg:{
        type:Boolean,
    },
    ctps:{
        type:Boolean,
    },
    cpf:{
        type:Boolean,
    },
    te:{
        type:Boolean,
    }
});

const participationAndSocialServices = new mongoose.Schema<ParticipationAndSocialServices>({
    isInUser:{
        type:Boolean,
    },
    serviceProgramOrProject:{
        type:String,
    },
    unityRealization:{
        type:String,
    },
    dateRealization:{
        type:Date,
    },
    dateConclusion:{
        type:Date,
    },
});

const pregnant = new mongoose.Schema<Pregnant>({
    pregnancyMonths:{
        type:Number,
    },
    hasPreNatal:{
        type:Boolean,
    },
    isInUse:{
        type:Boolean,
    },
});

const ocurruncyBolsaFamilia = new mongoose.Schema<OcurruncyBolsaFamilia>({
    ocurruncyDate:{
        type:Date,
    },
    efect:{
        type:Number,
    },
    suspensionSolicitation:{
        type:Boolean,
    },
});

const educationConditionPerson = new mongoose.Schema<EducationConditionPerson>({
    isInUse:{
        type:Boolean,
    },
    literate:{
        type:Boolean,
    },
    schoolShip:{
        type:Number
    },
    isStudying:{
        type:Boolean,
    },
    ocorruncyBolsaFamilia:{
        type:ocurruncyBolsaFamilia
    }
});

const workConditionPerson = new mongoose.Schema<WorkConditionPerson>({
    isInUse:{
        type:Boolean,
    },
    hasWorkCard:{
        type:Boolean,
    },
    workCondition:{
        type:String,
    },
    workQualification:{
        type:String,
    },
    workValue:{
        type:Number,
    }
})

const HelphyConditionFamilyPerson = new mongoose.Schema<HelphyConditionFamily>({
  helphyNeeds:{
        type:Boolean,
    },
    typeOfDeficiency:{
        type:String,
    },

    whoIsResponsibleForHelp:{
        type:String,
    },
    isInUse:{
        type:Boolean,
    }
})

const familyComunitaryConvivationPerson = new mongoose.Schema<FamilyComunitaryConvivation>({
    isInUse:{
        type:Boolean,
    },
    dateOfInit:{
        type:Date,
    },
    dateOfFinish:{
        type:Date,
    },
    unity:{
        type:Number,
    },
    serviceType:{
        type:Number,
    }
})

const familyHistorySocioEducationPerson = new mongoose.Schema<FamilyHistorySocioEducation>({
    dateInit:{
        type:Date,
    },
    dateFinish:{
        type:Date,
    },
    numberOfProcess:{
        type:String,
    },
    type:{
        type:Number,
    },
    inInUse:{
        type:Boolean,
    }
})

const familyInstitucionalHistoryPerson = new mongoose.Schema<FamilyInstitucionalHistory>({
    dateInit:{
        type:Date,
    },
    dateFinish:{
        type:Date,
    },
    reason:{
        type:String,
    },
    inInUse:{
        type:Boolean,
    }
})

const familyCompositionPerson = new mongoose.Schema<FamilyCompositionPerson>({
    fullName:{
        type:String,
    },
    birthDate:{
        type:Date,
    },
    biologicalGender:{
        type:String,
    },
    personWithDisability:{
        type:Boolean,
    },
    documents:{
        type:documents
    },
    kinship:{
        type:Number,
    },
    historySocialLaOrPSC:{
        type:Boolean,
    },  
    educationConditionPerson:{
        type:educationConditionPerson
    },
    workConditionPerson:{
        type:workConditionPerson
    },
    participationAndSocialServices:{
        type:participationAndSocialServices
    },
    pregnant:{
        type:pregnant
    },
    helphyConditionFamily:{
        type:HelphyConditionFamilyPerson
    },
    familyComunitaryConvivation:{
        type:familyComunitaryConvivationPerson
    },
    familyHistorySocioEducation:{
        type:familyHistorySocioEducationPerson
    },
    familyInstitutionalHistory:{
        type:familyInstitucionalHistoryPerson
    }
});

const familyComposition = new mongoose.Schema<FamilyComposition>({
    socialEspecification:{
        type:String,
    },
    espeficationEthnicity:{
        type:String,
    },
    familyCompositionPerson:[{
        type:familyCompositionPerson
    }],
    observation:[{
        type:observation
    }],
    isInUse:{
        type:Boolean,
        default:false
    }
})

export const familyCompositionModel = mongoose.model('familyComposition',familyComposition);