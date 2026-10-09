import { EventEmitter } from "events";

export default class ConfirmChannelManager extends EventEmitter {
  constructor({ rabbitMq, logger }) {
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
      let connection;

      if (this._rabbitMq.connection) {
        connection = this._rabbitMq.connection;
      } else {
        await this._rabbitMq.connect();

        if (!this._rabbitMq.connection) {
          throw new Error(
            "[ConfirmChannelManager] Failed to obtain rabbitMq connection",
          );
        }

        connection = this._rabbitMq.connection;
      }

      const confirmChannel = await connection.createConfirmChannel();

      confirmChannel.on("drain", () => {
        this.emit("drain");
      });

      confirmChannel.on("close", () => {
        this._logger.warn(
          "[ConfirmChannelManager] confirm channel closed unexpectedly",
        );
        this._channel = null;
      });

      confirmChannel.on("error", (err) => {
        this._logger.warn(
          "[ConfirmChannelManager] confirm channel throws error",
          {
            error: err.message,
            stack: err.stack,
            code: err.code,
          },
        );
        this._channel = null;
        this.emit("error", err);
      });

      this._channel = confirmChannel;
      this._logger.info("[ConfirmChannelManager] confirm channel ready");

      for (const i of this._connectWaiters) {
        i.resolve(confirmChannel);
      }

      this._connectWaiters = [];

      return confirmChannel;
    } catch (error) {
      for (const i of this._connectWaiters) {
        i.reject(error);
      }
      this._connectWaiters = [];
      return error;
    } finally {
      this._connecting = false;
    }
  }
}
