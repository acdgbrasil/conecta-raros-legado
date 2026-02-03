import { prefixRoutes } from "@modules/shared/http/route-utils";
import { IamRouteMap } from "../../../types/types";
import { loginMobileController } from "../controllers/login.mobile.controller";
import { refreshMobileController } from "../controllers/refresh.mobile.controller";

const mobileRouter: IamRouteMap = {
  "/login": {
    POST: loginMobileController
  },
  "/refresh": {
    POST: refreshMobileController
  }
};


export const IamMobileRouter = prefixRoutes("/mobile", mobileRouter);