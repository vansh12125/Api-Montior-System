import { ResponseFormatter } from "../utils/index.js";

const validate = (schema, source = "body") => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[source] ?? {}, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errors = error.details.map((detail) => ({
        field: detail.path.join("."),
        message: detail.message,
      }));

      return res.status(400).json(ResponseFormatter.validationError(errors));
    }

    req[source] = value;

    next();
  };
};

export { validate };