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
      const result =await this.clientService.createViewer(req, res);

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
}
