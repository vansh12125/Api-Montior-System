import amqp from "amqplib";

import logger from "./logger.js";
import config from "../constants/index.js";

class RabbitMqConnection {
  constructor() {
    this.connection = null;
    this.channel = null;
    this.connectPromise = null;
  }

  /**
   * Connects to RabbitMQ and creates a channel.
   *
   * If a connection already exists, the existing channel is returned.
   * If another connection attempt is already in progress, this method
   * waits for that attempt instead of creating another connection.
   *
   * @returns {Promise<Channel>} The RabbitMQ channel.
   * @throws {Error} If the RabbitMQ connection fails.
   */
  async connectRabbitMq() {
    if (this.channel) {
      return this.channel;
    }

    if (this.connectPromise) {
      return this.connectPromise;
    }

    this.connectPromise = this._createConnection();

    try {
      return await this.connectPromise;
    } finally {
      this.connectPromise = null;
    }
  }

  /**
   * Creates the RabbitMQ connection, channel and required queues.
   *
   * @returns {Promise<Channel>} The initialized RabbitMQ channel.
   * @throws {Error} If connection, channel or queue initialization fails.
   */
  async _createConnection() {
    try {
      logger.info("Connecting to RabbitMQ");

      const connection = await amqp.connect(config.rabbitmq.url);
      const channel = await connection.createChannel();

      const queue = config.rabbitmq.queue;
      const deadLetterQueue = `${queue}.dlq`;
      const normalQueue = `${queue}.nq`;

      await channel.assertQueue(deadLetterQueue, {
        durable: true,
      });

      await channel.assertQueue(normalQueue, {
        durable: true,
        arguments: {
          "x-dead-letter-exchange": "",
          "x-dead-letter-routing-key": deadLetterQueue,
        },
      });

      this.connection = connection;
      this.channel = channel;

      connection.on("close", () => {
        logger.warn("RabbitMQ connection closed");

        this.connection = null;
        this.channel = null;
      });

      connection.on("error", (error) => {
        logger.error("RabbitMQ connection error", error);

        this.connection = null;
        this.channel = null;
      });

      logger.info("RabbitMQ connected successfully");

      return channel;
    } catch (error) {
      this.connection = null;
      this.channel = null;

      logger.error("Failed to connect to RabbitMQ:", error);

      throw error;
    }
  }

  /**
   * Returns the currently active RabbitMQ channel.
   *
   * @returns {Channel | null} The active channel or null.
   */
  getChannel() {
    return this.channel;
  }

  /**
   * Returns the current RabbitMQ connection status.
   *
   * @returns {"connected" | "connecting" | "disconnected"}
   */
  getStatus() {
    if (this.channel) {
      return "connected";
    }

    if (this.connectPromise) {
      return "connecting";
    }

    return "disconnected";
  }

  /**
   * Closes the RabbitMQ channel and connection.
   *
   * @returns {Promise<void>}
   */
  async close() {
    try {
      if (this.channel) {
        await this.channel.close();
        this.channel = null;
      }

      if (this.connection) {
        await this.connection.close();
        this.connection = null;
      }

      logger.info("RabbitMQ connection closed");
    } catch (error) {
      logger.error("Error while closing RabbitMQ connection:", error);

      this.channel = null;
      this.connection = null;

      throw error;
    }
  }
}

export default new RabbitMqConnection();
