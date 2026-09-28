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
}
