import { Router } from "express";
import dependencies from "../dependencies/clientDependency.js";
import { validate } from "../../../middlewares/validation.middleware.js";
import {
  registerClient,
  createApiKey,
  changeIsActiveApiKey,
  deleteApiKey
} from "../validations/client.validation.js";

const clientRouter = Router();
const { controller, middleware } = dependencies;
const clientController = controller.clientController;
const jwtMiddleware = middleware.jwtMiddleware;
const clientAdminMiddleware = middleware.clientAdminMiddleware;

clientRouter.use(jwtMiddleware);

clientRouter.post(
  "/users",
  clientAdminMiddleware,
  validate(registerClient),
  (req, res, next) => {
    clientController.registerClientViewer(req, res, next);
  },
);

clientRouter.get("/users", clientAdminMiddleware, (req, res, next) => {
  clientController.getAllClientViewer(req, res, next);
});

clientRouter.post(
  "/",
  clientAdminMiddleware,
  validate(registerClient),
  (req, res, next) => {
    clientController.registerClientAdmin(req, res, next);
  },
);

clientRouter.get("/", clientAdminMiddleware, (req, res, next) => {
  clientController.getAllClientAdmin(req, res, next);
});

clientRouter.post(
  "/api-keys",
  clientAdminMiddleware,
  validate(createApiKey),
  (req, res, next) => {
    clientController.createApiKey(req, res, next);
  },
);

clientRouter.get(
  "/api-keys",
  clientAdminMiddleware,
  (req, res, next) => {
    clientController.getAllApiKey(req, res, next);
  },
);

clientRouter.patch(
  "/api-keys/deactivate",
  clientAdminMiddleware,
  validate(changeIsActiveApiKey),
  (req, res, next) => {
    clientController.deactivateApiKey(req, res, next);
  },
);

clientRouter.patch(
  "/api-keys/activate",
  clientAdminMiddleware,
  validate(changeIsActiveApiKey),
  (req, res, next) => {
    clientController.activateApiKey(req, res, next);
  },
);

clientRouter.delete(
  "/api-keys",
  clientAdminMiddleware,
  validate(deleteApiKey),
  (req, res, next) => {
    clientController.deleteApiKey(req, res, next);
  },
);

export { clientRouter };
