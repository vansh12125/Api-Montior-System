import { EventEmitter } from "events";

export default class ConfirmChannelManager extends EventEmitter {
  constructor({ rabbitMq, logger }) {
    super();
    if (!rabbitMq) {
      throw new Error(
        "[ConfirmChannelManager] require rabbitMq connection manager",
      );
    }

    this._rabbitMq = rabbitMq;
    this._logger = logger ?? console;
    this._channel = null;
    this._connecting = false;
    this._connectWaiters = [];
  }

  async getChannel() {
    if (this._channel) {
      return this._channel;
    }

    if (this._connecting) {
      return new Promise((resolve, reject) => {
        this._connectWaiters.push({ resolve, reject });
      });
    }

    return this._connect();
  }

  async _connect() {
    this._connecting = true;

    try {
      const connection = await this._withTimeout(
        (async () => {
          if (!this._rabbitMq.connection) {
            await this._rabbitMq.connectRabbitMq();
          }

          if (!this._rabbitMq.connection) {
            throw new Error("RabbitMQ connection unavailable");
          }

          return this._rabbitMq.connection;
        })(),
        5000,
        "RabbitMQ connection timed out",
      );

      const confirmChannel = await this._withTimeout(
        connection.createConfirmChannel(),
        5000,
        "RabbitMQ confirm channel creation timed out",
      );

      confirmChannel.on("drain", () => {
        this.emit("drain");
      });

      confirmChannel.on("return", (message) => {
        this._logger.error("[RabbitMQ] Unroutable message", {
          exchange: message.fields.exchange,
          routingKey: message.fields.routingKey,
          messageId: message.properties.messageId,
        });
      });

      confirmChannel.on("close", () => {
        this._logger.warn("[ConfirmChannelManager] Confirm channel closed");
        if (this._channel === confirmChannel) {
          this._channel = null;
        }
      });

      confirmChannel.on("error", (err) => {
        this._logger.error("[ConfirmChannelManager] Channel error", {
          message: err.message,
          code: err.code,
        });

        if (this._channel === confirmChannel) {
          this._channel = null;
        }
      });

      this._channel = confirmChannel;

      this._logger.info("[ConfirmChannelManager] Confirm channel ready");

      for (const waiter of this._connectWaiters) {
        waiter.resolve(confirmChannel);
      }

      this._connectWaiters = [];

      return confirmChannel;
    } catch (error) {
      for (const waiter of this._connectWaiters) {
        waiter.reject(error);
      }

      this._connectWaiters = [];
      throw error;
    } finally {
      this._connecting = false;
    }
  }

  _withTimeout(promise, timeoutMs, message) {
    let timer;

    return Promise.race([
      promise,
      new Promise((_, reject) => {
        timer = setTimeout(() => {
          const error = new Error(message);
          error.code = "ETIMEDOUT";
          reject(error);
        }, timeoutMs);
      }),
    ]).finally(() => clearTimeout(timer));
  }

  async close() {
    const channel = this._channel;
    this._channel = null;

    if (channel) {
      await channel.close();
    }
  }
}
