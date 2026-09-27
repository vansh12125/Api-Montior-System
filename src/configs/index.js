import logger from "./logger.js";
import mongodb from "./mongodb.js";
import postgres from "./postgres.js";
import rabbitmq from "./rabbitmq.js";

/**
 * Initialize database connections
 */
async function initializeConnection() {
  try {
    logger.info("Initializing database connections...");

    // Connect to MongoDB;
    await mongodb.connectDb();

    // Connect to PG;
    await postgres.testConnection();

    // Connect to RabbitMQ;
    await rabbitmq.connectRabbitMq();

    logger.info("All connections established successfully");
  } catch (error) {
    logger.error("Failed to initialize connections:", error);
    throw error;
  }
}

/**
 * Disconnect database connections
 */
async function disconnectConnection() {
  try {
    logger.info("Disconnecting database connections...");

    // disconnect MongoDB;
    await mongodb.disconnect();

    // disconnect PG;
    await postgres.close();

    // disconnect RabbitMQ;
    await rabbitmq.close();

    logger.info("All connections disconnected successfully");
  } catch (error) {
    logger.error("Failed to disconnected connections:", error);
    throw error;
  }
}

export { initializeConnection, disconnectConnection,logger, mongodb, postgres, rabbitmq };
