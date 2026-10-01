import { ResponseFormatter } from "../../../utils/index.js";
import { logger } from "../../../configs/index.js";

export default class AuthController {
  constructor(authService) {
    if (!authService) {
      throw new Error("Auth service is required");
    }
    this.authService = authService;
  }

  async registerClientAdmin(req, res, next) {
    try {
      const result = await this.authService.registerClientAdmin(req.body);
      logger.debug("ClientAdmin created successfully: ", result);

      return res
        .status(201)
        .json(
          ResponseFormatter.success(
            201,
            "Client admin registered successfully",
            result,
          ),
        );
    } catch (error) {
      logger.error("Error occurred in registering ClientAdmin: ", error);
      next(error);
    }
  }

  async loginUser(req, res, next) {
    try {
      const result = await this.authService.loginUser(req, res);
      logger.debug("Client login successfully ");
      return res
        .status(200)
        .json(
          ResponseFormatter.success(
            200,
            "Client logged in successfull",
            result,
          ),
        );
    } catch (error) {
      logger.error("Error occurred in loginUser: ", error);
      next(error);
    }
  }

  async getProfile(req, res, next) {
    try {
      const result = await this.authService.getProfile(req);
      logger.debug("Fetched client profile successfully ");
      return res
        .status(200)
        .json(
          ResponseFormatter.success(
            200,
            "Fetched client profile successfully ",
            result,
          ),
        );
    } catch (error) {
      logger.error("Error occurred in loginUser: ", error);
      next(error);
    }
  }

  async rotateRefreshToken(req, res,next) {
    try {
      const result =await this.authService.rotateRefreshToken(req, res);

      return res
        .status(200)
        .json(ResponseFormatter.success(200, "Token refreshed", result));
    } catch (error) {
      logger.error("Error occurred in rotateRefreshToken: ", error);
      next(error);
    }
  }
}
