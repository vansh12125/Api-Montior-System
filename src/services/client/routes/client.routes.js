import { Router } from "express";
import dependencies from "../dependencies/clientDependency.js";
import { validate } from "../../../middlewares/validation.middleware.js";
import { registerClientViewer } from "../validations/client.validation.js";

const clientRouter = Router();
const { controller, middleware } = dependencies;
const clientController = controller.clientController;
const jwtMiddleware = middleware.jwtMiddleware;
const clientAdminMiddleware=middleware.clientAdminMiddleware;

clientRouter.post(
  "/users",
  jwtMiddleware,
  clientAdminMiddleware,
  validate(registerClientViewer),
  (req, res, next) => {
    clientController.registerClientViewer(req, res, next);
  },
);

clientRouter.get(
  "/users",
  jwtMiddleware,
  clientAdminMiddleware,
  (req, res, next) => {
    clientController.getAllClientViewer(req, res, next);
  },
);

export { clientRouter };
