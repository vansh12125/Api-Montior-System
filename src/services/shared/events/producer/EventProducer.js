import { EVENT_TYPES } from "../EventContracts.js";
import { isRetryable } from "./RetryStrategy.js";

export default class EventPrdoucer {
  constructor({
    channelManager,
    circuitBreaker,
    retryStartegy,
    logger,
    queueName,
  }) {
    if (!channelManager) {
      throw new Error("Channel Manager is required");
    }
    if (!circuitBreaker) {
      throw new Error("Circuit Breaker is required");
    }
    if (!retryStartegy) {
      throw new Error("Retry Startegy is required");
    }
    if (!queueName) {
      throw new Error("Queue Name is required");
    }

    this._channelManager = channelManager;
    this._retryStartegy = retryStartegy;
    this._circuitBreaker = circuitBreaker;
    this._queueName = queueName;
    this._logger = logger ?? console;
  }
}
