import joi from "joi";

import { VALIDATION } from "../../../constants/validation.js";

const passwordSchema = joi
  .string()
  .custom((value) => value.replace(/\s/g, ""))
  .min(VALIDATION.PASSWORD.MIN_LENGTH)
  .max(VALIDATION.PASSWORD.MAX_LENGTH)
  .required();

const registerClientAdminSchema = joi.object({
  name: joi
    .string()
    .trim()
    .min(VALIDATION.NAME.MIN_LENGTH)
    .max(VALIDATION.NAME.MAX_LENGTH)
    .required(),
  username: joi
    .string()
    .trim()
    .lowercase()
    .min(VALIDATION.USERNAME.MIN_LENGTH)
    .max(VALIDATION.USERNAME.MAX_LENGTH)
    .pattern(VALIDATION.USERNAME.PATTERN)
    .required(),

  email: joi
    .string()
    .trim()
    .lowercase()
    .email()
    .max(VALIDATION.EMAIL.MAX_LENGTH)
    .required(),

  password: passwordSchema,

  clientName: joi
    .string()
    .trim()
    .min(VALIDATION.CLIENT_NAME.MIN_LENGTH)
    .max(VALIDATION.CLIENT_NAME.MAX_LENGTH)
    .required(),

  clientEmail: joi
    .string()
    .trim()
    .lowercase()
    .email()
    .max(VALIDATION.EMAIL.MAX_LENGTH)
    .required(),

  description: joi
    .string()
    .trim()
    .max(VALIDATION.DESCRIPTION.MAX_LENGTH)
    .required(),

  website: joi
    .string()
    .trim()
    .uri()
    .max(VALIDATION.WEBSITE.MAX_LENGTH)
    .required(),
});

const loginClientSchema = joi.object({
  context: joi.string().trim().lowercase().required(),

  password: passwordSchema,
});

const updatePasswordSchema = joi.object({
  currentPassword: passwordSchema,

  newPassword: passwordSchema
    .invalid(joi.ref("currentPassword"))
    .messages({
      "any.invalid": "New password must be different from current password",
    }),
});

export { registerClientAdminSchema, loginClientSchema, updatePasswordSchema };
