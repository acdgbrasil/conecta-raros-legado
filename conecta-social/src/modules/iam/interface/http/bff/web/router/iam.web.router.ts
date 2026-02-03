import { prefixRoutes } from "@modules/shared/http/route-utils";
import { IamRouteMap } from "../../../types/types";
import { loginWebController } from "../controllers/auth/login.web.controller";
import { refreshWebController } from "../controllers/auth/refresh.web.controller";

const AuthWebRouter: IamRouteMap = {
  "/auth/login": {
    POST: loginWebController
  },
  "/auth/refresh": {
    POST: refreshWebController
  }
};


export const IamWebRouter = prefixRoutes("/web", AuthWebRouter);