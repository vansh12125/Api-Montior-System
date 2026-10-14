import joi from "joi";

import { VALIDATION } from "../../../constants/validation.js";
import { API_METHODS } from "../../../enums/index.js";

const validateHitData = joi.object({
  serviceName: joi
    .string()
    .trim()
    .lowercase()
    .min(VALIDATION.SERVICE_NAME.MIN_LENGTH)
    .max(VALIDATION.SERVICE_NAME.MAX_LENGTH)
    .required(),
  endpoint: joi.string().trim().lowercase().required(),
  method: joi
    .string()
    .valid(...Object.values(API_METHODS))
    .required(),
  statusCode: joi.number().min(100).max(599).required(),
  latencyMs: joi.number().min(0).required(),
});

export {validateHitData};