import { Router } from "express";
import dependencies from "../dependencies/clientDependency.js";
import { validate } from "../../../middlewares/validation.middleware.js";
import { registerClientViewer } from "../validations/client.validation.js";

const clientRouter = Router();
const { controller, middleware } = dependencies;
const clientController = controller.clientController;
const jwtMiddleware = middleware.jwtMiddleware;

clientRouter.post(
  "/users",
  jwtMiddleware,
  validate(registerClientViewer),
  (req, res, next) => {
    clientController.registerClientViewer(req, res, next);
  },
);

export { clientRouter };
