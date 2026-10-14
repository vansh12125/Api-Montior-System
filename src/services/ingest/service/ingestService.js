import { logger } from "../../../configs/index.js";
import ApiError from "../../../error/ApiError.js";
import { v4 as uuid } from "uuid";

export default class IngestService {
  constructor({ eventProducer }) {
    if (!eventProducer) {
      throw new Error("Event producer is required");
    }

    this._eventProducer = eventProducer;
  }

  async ingestApiHit(req, hitData) {
    const event = {
      eventId: uuid(),
      timestamp: new Date(),
      serviceName: hitData.serviceName,
      endpoint: hitData.endpoint,
      method: hitData.method,
      statusCode: hitData.statusCode,
      latencyMs: hitData.latencyMs,
      clientId: req.apiKey.clientId,
      apiKeyId: req.apiKey.id,
      ip: hitData.ip || "unknown",
      userAgent: hitData.userAgent || "unknown",
    };

    try {
      const published = await this._eventProducer.publishApiHit(event);

      if (!published) {
        throw new Error("Event was not published");
      }

      logger.debug("API hit ingested", {
        eventId: event.eventId,
        endpoint: event.endpoint,
        serviceName: event.serviceName,
        method: event.method,
        clientId: event.clientId,
      });

      return {
        eventId: event.eventId,
        status: "queued",
        timestamp: event.timestamp,
      };
    } catch (error) {
      logger.error("Failed to queue API hit", {
        eventId: event.eventId,
        message: error.message,
      });

      throw new ApiError("Event ingestion is temporarily unavailable", 503);
    }
  }
}
