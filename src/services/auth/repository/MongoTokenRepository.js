import BaseTokenRepository from "../repository/BaseTokenRepository.js";
import { RefreshToken } from "../../../models/index.js";
import { logger } from "../../../configs/index.js";

export default class MongoTokenRepository extends BaseTokenRepository {
  constructor() {
    super(RefreshToken);
  }

  async create(tokenData, options = {}) {
    try {
      const token = new this.model(tokenData);

      await token.save({
        session: options.session,
      });
      return token.toJSON();
    } catch (error) {
      logger.error(`Error occured in createToken: ${error}`);
      throw error;
    }
  }

  async findById(id, options = {}) {
    try {
      throw new Error("Method not implemented");
    } catch (error) {
      logger.error(`Error occured in findById: ${error}`);
      throw error;
    }
  }

  async findByTokenHash(tokenHash, options = {}) {
    try {
      throw new Error("Method not implemented");
    } catch (error) {
      logger.error(`Error occured in findByTokenHash: ${error}`);
      throw error;
    }
  }

  async findBySessionId(sessionId, options = {}) {
    try {
      return await this.model
        .findOne({
          sessionId,
          revoked: false,
        })
        .session(options.session || null);
    } catch (error) {
      logger.error(`Error occurred in findBySessionId: ${error}`);
      throw error;
    }
  }

  async findByUserId(userId, options = {}) {
    try {
      throw new Error("Method not implemented");
    } catch (error) {
      logger.error(`Error occured in findByUserId : ${error}`);
      throw error;
    }
  }

  async findAndRevokeByTokenHashAndSessionId(
    tokenHash,
    sessionId,
    options = {},
  ) {
    try {
      return await this.model.findOneAndUpdate(
        {
          tokenHash,
          sessionId,
          revoked: false,
        },
        {
          $set: {
            revoked: true,
          },
        },
        {
          returnDocument: "before",
          session: options.session || null,
        },
      );
    } catch (error) {
      logger.error(
        `Error occurred in findAndRevokeByTokenHashAndSessionId: ${error}`,
      );
      throw error;
    }
  }

  async findByTokenHashAndSessionId(tokenHash, sessionId, options = {}) {
    try {
      return await this.model
        .findOne({ tokenHash, sessionId, revoked: false })
        .session(options.session || null);
    } catch (error) {
      logger.error(`Error occurred in findByTokenHashAndSessionId: ${error}`);
      throw error;
    }
  }
}
