import joi from "joi";

import { VALIDATION } from "../../../constants/validation.js";

const registerClientViewer = joi.object({
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

export {registerClientViewer};
