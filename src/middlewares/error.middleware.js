import { ResponseFormatter } from "../utils/index.js";
import { logger } from "../configs/index.js";

const errorHandler = (error, req, res, next) => {
  logger.error(error);

  const statusCode = error.statusCode || 500;

  const message = statusCode === 500 ? "Internal server error" : error.message;

  const errorDetails = statusCode === 500 ? null : error.error;

  return res
    .status(statusCode)
    .json(ResponseFormatter.error(statusCode, message, errorDetails));
};

export default errorHandler;
