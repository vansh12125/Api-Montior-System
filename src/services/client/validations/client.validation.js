import joi from "joi";

import { VALIDATION } from "../../../constants/validation.js";
import { API_ENIVORNMENT } from "../../../enums/index.js";

const registerClient = joi.object({
  name: joi
    .string()
    .trim()
    .min(VALIDATION.NAME.MIN_LENGTH)
    .max(VALIDATION.NAME.MAX_LENGTH)
    .required(),

  email: joi
    .string()
    .trim()
    .lowercase()
    .email()
    .max(VALIDATION.EMAIL.MAX_LENGTH)
    .required(),
});

const createApiKey = joi.object({
  name: joi
    .string()
    .trim()
    .min(VALIDATION.NAME.MIN_LENGTH)
    .max(VALIDATION.NAME.MAX_LENGTH)
    .required(),

  description: joi
    .string()
    .trim()
    .min(VALIDATION.DESCRIPTION.MIN_LENGTH)
    .max(VALIDATION.DESCRIPTION.MAX_LENGTH)
    .required(),

  enivornment: joi
    .string()
    .valid(...Object.values(API_ENIVORNMENT))
    .required(),
});

const changeIsActiveApiKey = joi.object({
  apiKeyId: joi.string().trim().required(),
});

const deleteApiKey = joi.object({
  apiKeyId: joi.string().trim().required(),
});

export { registerClient, createApiKey, changeIsActiveApiKey,deleteApiKey };
