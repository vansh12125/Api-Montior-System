import mongoose, { type Connection } from "mongoose";

import logger from "./logger";
import config from "./constants";

/**
 * MongoDB database manager/connector
 */
class MongoConnection {
  private connection: Connection | null;

  constructor() {
    this.connection = null;
  }

  /**
   * Connect to MongoDB
   * @returns {Promise<Connection>}
   */
  async connectDb(): Promise<Connection> {
    try {
      if (this.connection && this.connection.readyState === 1) {
        logger.info("MongoDB already connected");
        return this.connection;
      }

      await mongoose.connect(config.mongo.uri, {
        dbName: config.mongo.dbName,
      });

      this.connection = mongoose.connection;

      this.connection.on("error", (error) => {
        logger.error("MongoDB connection error:", error);
      });

      this.connection.on("disconnected", () => {
        logger.warn("MongoDB disconnected");
        this.connection = null;
      });

      this.connection.on("reconnected", () => {
        logger.info("MongoDB reconnected");
      });

      logger.info("MongoDB connected successfully");

      return this.connection;
    } catch (error) {
      logger.error("Failed to connect to MongoDB:", error);
      this.connection = null;
      throw error;
    }
  }

  /**
   * This helps to disconnet the active mongodb connection
   */
  async disconnect(): Promise<void> {
    try {
      if (!this.connection) {
        return;
      }

      await mongoose.disconnect();

      this.connection = null;

      logger.info("MongoDB disconnected");
    } catch (error) {
      logger.error("Failed to disconnect from MongoDB:", error);
      throw error;
    }
  }

  /**
   * Get the active connection
   * @returns {mongoose.Connection|null}
   */
  getConnection(): Connection | null {
    return this.connection;
  }
}

export default new MongoConnection();
