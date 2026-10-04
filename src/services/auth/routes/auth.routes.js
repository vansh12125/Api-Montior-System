import { Router } from "express";
import dependencies from "../dependencies/authDependency.js";
import { validate } from "../../../middlewares/validation.middleware.js";
import {
  registerClientAdminSchema,
  loginClientSchema,
  updatePasswordSchema,
} from "../validations/auth.validation.js";

const authRouter = Router();
const { controller, middleware } = dependencies;
const authController = controller.authController;
const jwtMiddleware = middleware.jwtMiddleware;

authRouter.post(
  "/signup",
  validate(registerClientAdminSchema),
  (req, res, next) => {
    authController.registerClientAdmin(req, res, next);
  },
);

authRouter.post("/signin", validate(loginClientSchema), (req, res, next) => {
  authController.loginUser(req, res, next);
});

authRouter.get("/me", jwtMiddleware, (req, res, next) => {
  authController.getProfile(req, res, next);
});

authRouter.post("/refresh", (req, res, next) => {
  authController.rotateRefreshToken(req, res, next);
});

authRouter.get("/signout", jwtMiddleware, (req, res, next) => {
  authController.logout(req, res, next);
});

authRouter.get("/signout/all", jwtMiddleware, (req, res, next) => {
  authController.logoutAllSession(req, res, next);
});

authRouter.patch(
  "/password",
  jwtMiddleware,
  validate(updatePasswordSchema),
  (req, res, next) => {
    authController.updateUserPassword(req, res, next);
  },
);

export { authRouter };
