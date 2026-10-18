import { Router } from "express";
import { validate } from "../../../middlewares/validation.middleware.js";
import dependencies from "../dependencies/analyticsDependency.js";

const analyticsRouter = Router();
const { controller, middleware } = dependencies;
const analyticsController = controller.analyticsController;
const jwtMiddleware = middleware.jwtMiddleware;
const clientAdminMiddleware = middleware.clientAdminMiddleware;

analyticsRouter.use(jwtMiddleware);

analyticsRouter.get("/stats", (req, res, next) => {
  analyticsController.getOverallStats(req, res, next);
});

analyticsRouter.get("/dashboard", (req, res, next) => {
  analyticsController.getDashboard(req, res, next);
});

analyticsRouter.get("/export", clientAdminMiddleware, (req, res, next) => {
  analyticsController.exportCsvData(req, res, next);
});

analyticsRouter.get("/endpoint-health", (req, res, next) => {
  analyticsController.getEndpointHealth(req, res, next);
});

export { analyticsRouter };
