import { logger } from "../../../configs/index.js";
import BaseApiKeyRepository from "./BaseApiKeyRepository.js";
import { ApiKey } from "../../../models/index.js";

export default class MongoApiKeyRepository extends BaseApiKeyRepository {
  constructor() {
    super(ApiKey);
  }

  async create(apikeyData, options = {}) {
    try {
      const key = new this.model(apikeyData);

      await key.save({ session: options.session });
      return key.toJSON();
    } catch (error) {
      logger.error(`Error occured in create:${error}`);
      throw error;
    }
  }

  async findById(apikeyId, options = {}) {
    try {
      return await this.model
        .findById(apikeyId)
        .session(options.session || null);
    } catch (error) {
      logger.error(`Error occured in findById:${error}`);
      throw error;
    }
  }

  async findByKeyValue(apikeyValue, options = {}) {
    try {
      return await this.model
        .findOne({ keyValue: apikeyValue })
        .session(options.session || null);
    } catch (error) {
      logger.error(`Error occured in findByKeyValue:${error}`);
      throw error;
    }
  }

  async findByActive(isActive = true, clientId, options = {}) {
    try {
      return await this.model
        .find({ isActive, clientId })
        .session(options.session || null);
    } catch (error) {
      logger.error(`Error occured in findByActive:${error}`);
      throw error;
    }
  }

  async findByClient(clientId, options = {}) {
    try {
      return await this.model
        .find({ clientId })
        .session(options.session || null);
    } catch (error) {
      logger.error(`Error occured in findByClient:${error}`);
      throw error;
    }
  }
}
