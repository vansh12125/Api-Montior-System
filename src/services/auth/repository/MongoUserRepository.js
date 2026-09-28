import BaseRepository from "./BaseRepository.js";
import { User } from "../../../models/index.js";
import { logger } from "../../../configs/index.js";

export default class MongoUserRepository extends BaseRepository {
  constructor() {
    super(User);
  }

  async create(userData) {
    try {
      const user = new this.model(userData);
      await user.save();
      return user.toJSON();
    } catch (error) {
      logger.error(`Error occurred while creating user: ${error}`);
      throw error;
    }
  }

  async findById(userId) {
    try {
      return await this.model.findById(userId).select("-password");
    } catch (error) {
      logger.error(`Error occurred while finding user by id: ${error}`);
      throw error;
    }
  }

  async findByUsername(username) {
    try {
      return await this.model.findOne({ username }).select("-password");
    } catch (error) {
      logger.error(`Error occurred while finding user by username: ${error}`);
      throw error;
    }
  }

  async findByEmail(email) {
    try {
      return await this.model.findOne({ email }).select("-password");
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

  async findByEmailOrUsername(email, username) {
    try {
      return await this.model
        .findOne({ $or: [{ email }, { username }] })
        .select("-password");
    } catch (error) {
      logger.error(`Error occurred while finding user by email or email: ${error}`);
      throw error;
    }
  }
}
