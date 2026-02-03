import { initializeInjections } from "./infra/di/injections.di";
import { IamRouter } from "./interface/http/router/iam.router";

async function initialSetupIam(): Promise<void> {
  // Inicializa Injeções de Dependência do Módulo IAM
  await initializeInjections();
  console.log("✅ Módulo IAM inicializado.");
}

export const IamModule = {
  initialize: async () => await initialSetupIam(),
  routes: IamRouter
};