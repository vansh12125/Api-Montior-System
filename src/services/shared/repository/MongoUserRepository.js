import BaseUserRepository from "./BaseUserRepository.js";
import { User } from "../../../models/index.js";
import { logger } from "../../../configs/index.js";
import { Roles } from "../../../enums/Roles.js";

export default class MongoUserRepository extends BaseUserRepository {
  constructor() {
    super(User);
  }

  async create(userData, options = {}) {
    try {
      const user = new this.model(userData);

      await user.save({
        session: options.session,
      });
      return user.toJSON();
    } catch (error) {
      logger.error(`Error occurred while creating user: ${error}`);
      throw error;
    }
  }

  async findById(userId, options = {}) {
    try {
      return await this.model
        .findById(userId)
        .session(options.session || null)
        .select("-password");
    } catch (error) {
      logger.error(`Error occurred while finding user by id: ${error}`);
      throw error;
    }
  }

  async findByUsername(username,options={}) {
    try {
      return await this.model.findOne({ username })
       .session(options.session || null)
       .select("-password");
    } catch (error) {
      logger.error(`Error occurred while finding user by username: ${error}`);
      throw error;
    }
  }

  async findByEmail(email, options = {}) {
    try {
      return await this.model
        .findOne({ email })
        .session(options.session || null)
        .select("-password");
    } catch (error) {
      logger.error(`Error occurred while finding user by email: ${error}`);
      throw error;
    }
  }

  async findAll() {
    try {
      return await this.model.find().select("-password");
    } catch (error) {
      logger.error(`Error occurred while finding all user: ${error}`);
      throw error;
    }
  }

  async findByEmailWithPassword(email) {
    try {
      return this.model.findOne({ email }).select("+password");
    } catch (error) {
      logger.error(
        `Error occurred while finding user by email with password: ${error}`,
      );
      throw error;
    }
  }

  async findAllActive() {
    try {
      return await this.model.find({ isActive: true }).select("-password");
    } catch (error) {
      logger.error(`Error occurred while finding all active user: ${error}`);
      throw error;
    }
  }

  async findByEmailOrUsername(email, username, options = {}) {
    try {
      return await this.model
        .findOne({ $or: [{ email }, { username }] })
        .session(options.session || null)
        .select("-password");
    } catch (error) {
      logger.error(
        `Error occurred while finding user by email or username: ${error}`,
      );
      throw error;
    }
  }

  async findUserForLogin(context, options = {}) {
    try {
      return await this.model
        .findOne({
          $or: [{ email: context }, { username: context }],
          role: { $ne: Roles.SUPER_ADMIN },
        })
        .session(options.session || null)
        .select("+password");
    } catch (error) {
      logger.error(
        `Error occurred while finding user by email or email: ${error}`,
      );
      throw error;
    }
  }
}
