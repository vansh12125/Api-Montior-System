import joi from "joi";

import { VALIDATION } from "../../../constants/validation.js";

const registerClientAdminSchema = joi.object({
  name: joi
    .string()
    .trim()
    .min(VALIDATION.NAME.MIN_LENGTH)
    .max(VALIDATION.NAME.MAX_LENGTH)
    .required(),
  username: joi.string()
    .trim()
    .lowercase()
    .min(VALIDATION.USERNAME.MIN_LENGTH)
    .max(VALIDATION.USERNAME.MAX_LENGTH)
    .pattern(VALIDATION.USERNAME.PATTERN)
    .required(),

  email: joi.string()
    .trim()
    .lowercase()
    .email()
    .max(VALIDATION.EMAIL.MAX_LENGTH)
    .required(),

  password: joi.string()
    .min(VALIDATION.PASSWORD.MIN_LENGTH)
    .max(VALIDATION.PASSWORD.MAX_LENGTH)
    .required(),

  clientName: joi.string()
    .trim()
    .min(VALIDATION.CLIENT_NAME.MIN_LENGTH)
    .max(VALIDATION.CLIENT_NAME.MAX_LENGTH)
    .required(),

  clientEmail: joi.string()
    .trim()
    .lowercase()
    .email()
    .max(VALIDATION.EMAIL.MAX_LENGTH)
    .required(),

  description: joi.string()
    .trim()
    .max(VALIDATION.DESCRIPTION.MAX_LENGTH)
    .required(),

  website: joi.string()
    .trim()
    .uri()
    .max(VALIDATION.WEBSITE.MAX_LENGTH)
    .required()
});

export { registerClientAdminSchema };
