import { Router } from "express";
import validateApiKeyMiddleware from "../../../middlewares/validateApiKey.middleware.js";
import ingestContainer from "../dependencies/ingestDependency.js";
import rate_limit from "express-rate-limit";
import config from "../../../constants/index.js";
import {validateHitData} from "../validations/ingest.validation.js";
import {validate} from "../../../middlewares/validation.middleware.js"

const ingestRouter = Router();

const rateLimit = rate_limit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  message: {
    success: false,
    message: "Too many request, please try again later",
    statusCode: 429,
  },
  legacyHeaders: false,
  standardHeaders: true,
});

const { ingestController } = ingestContainer;

ingestRouter.get("/test", validateApiKeyMiddleware, (req, res) => {
  res.status(200).json({
    success: true,
    message: "API key verified successfully",
    data: req.apiKey,
  });
});

ingestRouter.post(
  "/",
  rateLimit,
  validateApiKeyMiddleware,
  validate(validateHitData),
  (req, res, next) => {
    return ingestController.ingestHit(req, res, next).catch(next);
  },
);

export { ingestRouter };
