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
}
