import config from "../constants/index.js";
import ApiError from "../error/ApiError.js";
import { logger } from "../configs/index.js";

const jwtMiddleware = (tokenService) => {
  if (!tokenService) {
    throw new Error("Token service is required.");
  }

  return async (req, res, next) => {
    try {
      const accessToken = req.cookies[config.jwt.cookie.accessTokenName];

      if (!accessToken) {
        throw ApiError.unauthorized("Authentication Required", {
          code: "AUTHENTICATION_REQUIRED",
        });
      }

      const decoded = await tokenService.verifyAccessToken(accessToken);
      req.user = {
        uId: decoded.uId,
        sId: decoded.sId,
        role: decoded.role,
      };

      logger.debug(`User jwt verified`);
      next();
    } catch (error) {
      logger.error(`Error occurred in Jwt Middleware: ${error}`);
      next(error);
    }
  };
};

export default jwtMiddleware;
