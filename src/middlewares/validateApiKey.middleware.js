import ApiError from "../error/ApiError.js";
import { logger } from "../configs/index.js";
import clientDependecy from "../services/client/dependencies/clientDependency.js";

/**
 * Middleware to validate API keys against database
 * Used for external services posting events
 * @param {Request} req
 * @param {Response} res
 * @param {*} next
 */
const validateApiKeyMiddleware = async (req, res, next) => {
  try {
    const apiKey = req.headers["x-key"];
    if (!apiKey) {
      logger.warn("API request without API key", {
        path: req.path,
        ip: req.ip || req.socket.remoteAddress,
      });

      throw ApiError.unauthorized("API key is required", {
        code: "AUTHENTICATION_REQUIRED",
      });
    }

    const parts = apiKey.split("_");

    if (
      parts.length !== 4 ||
      parts[0] !== "ak" ||
      !["live", "stage", "dev", "test"].includes(parts[1])
    ) {
      throw ApiError.badRequest("Malformed Api key", { code: "MALFORMED_KEY" });
    }

    const [, prefix, keyId, secret] = parts;

    const { id, clientId, enivornment, permissions } =
      await clientDependecy.service.clientService.getClientByApiKey(
        keyId,
        secret,
        prefix,
      );

    req.apiKey = {
      id,
      clientId,
      enivornment,
      permissions,
    };

    next();
  } catch (error) {
    logger.error(`Error occurred in validateApiKeyMiddleware: ${error}`);
    next(error);
  }
};

export default validateApiKeyMiddleware;
