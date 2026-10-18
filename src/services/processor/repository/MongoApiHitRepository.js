import { ApiHit } from "../../../models/index.js";
import { logger } from "../../../configs/index.js";

export class ApiHitRepository {
  constructor() {
    this._model = ApiHit;
  }

  async save(eventData, options = {}) {
    try {
      const data = new this._model(eventData);
      await data.save({
        session: options.session,
      });

      return data;
    } catch (error) {
      logger.error("Error occurred in save, ApiHitRepository: ", error);
      throw error;
    }
  }

  async find(filter = {}, options = {}) {
    try {
      const { limit = 50, skip = 0, sort = { timestamp: -1 } } = options;
      const data = await this._model
        .find(filter)
        .sort(sort)
        .limit(limit)
        .skip(skip)
        .session(options.session || null)
        .lean();

      return data;
    } catch (error) {
      logger.error("Error occurred in find, ApiHitRepository: ", error);
      throw error;
    }
  }

  async count(filter = {}, options = {}) {
    try {
      return await this._model.countDocuments(filter);
    } catch (error) {
      logger.error("Error occurred in count, ApiHitRepository: ", error);
      throw error;
    }
  }

  async deleteOldHits(beforeDate, options = {}) {
    try {
      const result = await this._model.deleteMany(
        { timestamp: { $lt: beforeDate } },
        { session: options.session || null },
      );

      return result;
    } catch (error) {
      logger.error(
        "Error occurred in deleteOldHits, ApiHitRepository: ",
        error,
      );
      throw error;
    }
  }

  async findHistory({
    clientId,
    serviceName,
    endpoint,
    method,
    statusCode,
    minLatency,
    maxLatency,
    startTime,
    endTime,
    limit = 25,
    offset = 0,
  } = {}) {
    try {
      if (!clientId) {
        throw new Error("Client ID is required");
      }

      const filter = { clientId };

      if (serviceName) filter.serviceName = serviceName;
      if (endpoint) filter.endpoint = endpoint;
      if (method) filter.method = method;

      if (statusCode !== undefined) {
        filter.statusCode = statusCode;
      }

      if (minLatency !== undefined || maxLatency !== undefined) {
        filter.latencyMs = {};

        if (minLatency !== undefined) {
          filter.latencyMs.$gte = minLatency;
        }

        if (maxLatency !== undefined) {
          filter.latencyMs.$lte = maxLatency;
        }
      }

      if (startTime || endTime) {
        filter.timestamp = {};

        if (startTime) {
          filter.timestamp.$gte = new Date(startTime);
        }

        if (endTime) {
          filter.timestamp.$lte = new Date(endTime);
        }
      }

      const [records, total] = await Promise.all([
        this._model
          .find(filter)
          .sort({ timestamp: -1 })
          .skip(offset)
          .limit(limit)
          .lean(),

        this._model.countDocuments(filter),
      ]);

      return { records, total };
    } catch (error) {
      logger.error("Error occurred in findHistory, ApiHitRepository:", error);
      throw error;
    }
  }
}
