import { logger } from "../../../configs/index.js";
import { ResponseFormatter } from "../../../utils/index.js";

export default class IngestController {
  constructor({ ingestService }) {
    if (!ingestService) {
      throw new Error("Ingest service is required");
    }

    this._ingestService = ingestService;
  }

  /**
   *
   * @param {Request} req
   * @param {Response} res
   * @param {*} next
   */
  async ingestHit(req, res, next) {
    try {
      const data = {
        ...req.body,
        clientId: req.apiKey.clientId,
        apiKeyId: req.apiKey.id,
        ip: req.id || req.connection.remoteAddress,
        userAgent: req.headers["user-agents"] ||req.headers["User-Agent"]|| "",
      };

      const result = await this._ingestService.ingestApiHit(req, data);

      return res
        .status(202)
        .json(
          ResponseFormatter.success(202, "Api hit queued successfull", result),
        );
    } catch (error) {
      logger.error("Error occured in ingestHit controller: ", error);
      next(error);
    }
  }
}
