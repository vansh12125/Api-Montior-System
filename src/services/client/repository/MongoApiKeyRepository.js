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

  async findByKeyId(apikeyId, options = {}) {
    try {
      return await this.model
        .findOne({ keyId: apikeyId })
        .select("+keyHash")
        .session(options.session || null);
    } catch (error) {
      logger.error(`Error occured in findByKeyId:${error}`);
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

  async findKeyByIdAndDeactivate(keyId, options = {}) {
    try {
      return await this.model
        .findOneAndUpdate(
          { keyId },
          {
            $set: { isActive: false },
          },
          { returnDocument: "after" },
        )
        .session(options.session || null);
    } catch (error) {
      logger.error(`Error occured in findByKeyIdAndDeactivate:${error}`);
      throw error;
    }
  }

  async findByKeyIdAndActivate(keyId, options = {}) {
    try {
      return await this.model
        .findOneAndUpdate(
          { keyId },
          {
            $set: { isActive: true },
          },
          { returnDocument: "after" },
        )
        .session(options.session || null);
    } catch (error) {
      logger.error(`Error occured in findByKeyIdAndActivate:${error}`);
      throw error;
    }
  }

  async findByKeyIdDelete(keyId, options = {}) {
    try {
      return await this.model
        .findOneAndDelete({ keyId })
        .session(options.session || null);
    } catch (error) {
      logger.error(`Error occured in findByKeyIdDelete:${error}`);
      throw error;
    }
  }

  async incrementRequestByKeyId(keyId) {
    try {
      return await this.model.findOneAndUpdate(
        { keyId },
        {
          $inc: { totalRequests: 1 },
          $set: { lastUsedAt: new Date() },
        },
        { returnDocument: "after" },
      );
    } catch (error) {
      logger.error(`Error occurred in incrementRequestByKeyId: ${error}`);
      throw error;
    }
  }
}
