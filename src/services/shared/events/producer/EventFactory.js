import { logger, rabbitmq } from "../../../../configs/index.js";
import configs from "../../../../constants/index.js";
import CircuitBreaker from "./CircuitBreaker.js";
import ConfirmChannelManager from "./ConfirmChannelManager.js";
import EventPrdoucer from "./EventProducer.js";
import RetryStrategy from "./RetryStrategy.js";

export function createEventFactory(override = {}) {
  const log = override.logger ?? logger;
  const rmq = override.rabbitmq ?? rabbitmq;
  const queueName = override.queueName ?? configs.rabbitmq.queue;

  if (!rmq) {
    throw new Error("RabbitMQ connection manager is required");
  }
  if (!queueName) {
    throw new Error("QueueName is required");
  }
  if (!configs.rabbitmq.retryAttempts || configs.rabbitmq.retryAttempts < 0) {
    throw new Error("Invalid retry attempts");
  }

  const channelManager =
    override.channelManager ??
    new ConfirmChannelManager({ logger: log, rabbitMq: rmq });

  const circuitBreaker =
    override.circuitBreaker ??
    new CircuitBreaker({
      failureThreshold: 5,
      cooldownMs: 30_000,

      halfOpenMaxAttempts: 3,
      logger: log,
    });

  const retryStrategy =
    override.retryStrategy ??
    new RetryStrategy({
      maxRetries: configs.rabbitmq.retryAttempts,
      baseDelayMs: configs.rabbitmq.retryDelay,
      maxDelayMs: 50_000,
      jitterFactor: 0.3,
    });

  return new EventPrdoucer({
    channelManager,
    circuitBreaker,
    retryStrategy,
    logger: log,
    queueName,
  });
}
