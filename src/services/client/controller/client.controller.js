import { logger } from "../../../configs/index.js";
import { ResponseFormatter } from "../../../utils/index.js";

export default class ClientController {
  constructor(clientService) {
    if (!clientService) {
      throw new Error("Client service is required");
    }
    this.clientService = clientService;
  }

  async registerClientViewer(req, res, next) {
    try {
      const result = await this.clientService.createViewer(req, res);

      return res
        .status(201)
        .json(
          ResponseFormatter.success(
            201,
            "Client viewer created successfully",
            result,
          ),
        );
    } catch (error) {
      logger.error("Error occurred in registerClientViewer: ", error);
      next(error);
    }
  }

  async getAllClientViewer(req, res, next) {
    try {
      const result = await this.clientService.getAllClientViewer(req, res);

      return res
        .status(200)
        .json(ResponseFormatter.success(200, "fetched client viewers", result));
    } catch (error) {
      logger.error("Error occurred in getAllClientViewer: ", error);
      next(error);
    }
  }

  async registerClientAdmin(req, res, next) {
    try {
      const result = await this.clientService.createAdmin(req, res);

      return res
        .status(201)
        .json(
          ResponseFormatter.success(
            201,
            "Client Admin created successfully",
            result,
          ),
        );
    } catch (error) {
      logger.error("Error occurred in registerClientAdmin: ", error);
      next(error);
    }
  }

  async getAllClientAdmin(req, res, next) {
    try {
      const result = await this.clientService.getAllClientAdmin(req, res);

      return res
        .status(200)
        .json(ResponseFormatter.success(200, "fetched client admins", result));
    } catch (error) {
      logger.error("Error occurred in getAllClientAdmin: ", error);
      next(error);
    }
  }

  async createApiKey(req, res, next) {
    try {
      const result = await this.clientService.createApiKey(req, res);

      return res
        .status(201)
        .json(
          ResponseFormatter.success(
            201,
            "Api Key created successfully",
            result,
          ),
        );
    } catch (error) {
      logger.error("Error occurred in createApiKey: ", error);
      next(error);
    }
  }

  async getAllApiKey(req, res, next) {
    try {
      const result = await this.clientService.getAllApiKey(req, res);

      return res
        .status(200)
        .json(
          ResponseFormatter.success(
            200,
            "Fetched All Api Keys successfully",
            result,
          ),
        );
    } catch (error) {
      logger.error("Error occurred in getAllApiKey: ", error);
      next(error);
    }
  }
}
