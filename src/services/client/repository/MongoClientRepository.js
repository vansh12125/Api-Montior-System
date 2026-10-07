import BaseClientRepository from "./BaseClientRepository.js";
import { Client } from "../../../models/index.js";
import { logger } from "../../../configs/index.js";

export default class MongoClientRepository extends BaseClientRepository {
  constructor() {
    super(Client);
  }

  async create(clientData, options = {}) {
    try {
      const client = new this.model(clientData);

      await client.save({
        session: options.session,
      });
      return client.toJSON();
    } catch (error) {
      logger.error(`Error occurred while creating client: ${error}`);
      throw error;
    }
  }

  async findById(clientId, options = {}) {
    try {
      return await this.model
        .findById(clientId)
        .session(options.session || null);
    } catch (error) {
      logger.error(`Error occurred while finding client by id: ${error}`);
      throw error;
    }
  }

  async findBySlug(slug, options = {}) {
    try {
      return await this.model
        .findOne({ slug })
        .session(options.session || null);
    } catch (error) {
      logger.error(`Error occurred while finding client by slug: ${error}`);
      throw error;
    }
  }

  async findByEmail(email, options = {}) {
    try {
      return await this.model
        .findOne({ email })
        .session(options.session || null);
    } catch (error) {
      logger.error(`Error occurred while finding client by email: ${error}`);
      throw error;
    }
  }

  async find(filters = {}, options = {}) {
    try {
      const { limit = 50, skip = 0, sort = { createdAt: -1 } } = options;

      return await this.model
        .find(filters)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .select("-__v");
    } catch (error) {
      logger.error(`Error occurred while finding client: ${error}`);
      throw error;
    }
  }

  async count(filters = {}) {
    try {
      return await this.model.countDocuments(filters);
    } catch (error) {
      logger.error(`Error occurred while counting client: ${error}`);
      throw error;
    }
  }

  async updateCreatedBy(clientId, userId, options = {}) {
    try {
      const client = await this.model.findByIdAndUpdate(
        clientId,
        {
          createdBy: userId,
        },
        {
          new: true,
          session: options.session,
        },
      );

      return client ? client.toJSON() : null;
    } catch (error) {
      logger.error(`Error occurred while updating client creator: ${error}`);

      throw error;
    }
  }
}
