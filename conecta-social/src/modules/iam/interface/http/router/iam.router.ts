import { IamMobileRouter } from "../bff/mobile/router/iam.mobile.router";
import { IamWebRouter } from "../bff/web/router/iam.web.router";
import { prefixRoutes } from "@modules/shared/http/route-utils";

// 1. Agrega as rotas dos BFFs (que já devem ter seus prefixos internos como /mobile e /web se definidos lá, 
// ou definimos aqui se lá estiverem puras.
// Assumindo que:
// IamMobileRouter tem chaves como "/mobile/login"
// IamWebRouter tem chaves como "/web/login"

const rawRoutes = {
  ...IamMobileRouter,
  ...IamWebRouter
};

// 2. Aplica o prefixo do Módulo (/iam)
// Resultado final: "/iam/mobile/login", "/iam/web/login"
export const IamRouter = prefixRoutes("/iam", rawRoutes);