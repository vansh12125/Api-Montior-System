import { Router } from "express";
import dependencies from "../dependencies/authDependency.js";
import { validate } from "../../../middlewares/validation.middleware.js";
import { registerClientAdminSchema,loginClientSchema } from "../validations/auth.validation.js";

const authRouter = Router();
const { controller } = dependencies;
const authController = controller.authController;

authRouter.post(
  "/signup",
  validate(registerClientAdminSchema),
  (req, res, next) => {
    authController.registerClientAdmin(req, res, next);
  },
);

authRouter.get(
  "/signin",
  validate(loginClientSchema),
  (req, res, next) => {
    authController.loginUser(req, res, next);
  },
);

export { authRouter };
