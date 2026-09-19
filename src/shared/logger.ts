import winston from "winston";
import config from "./constants";

/**
 * Winston logger configuration
 */
const logger = winston.createLogger({
  level: config.nodeEnv === "prodcution" ? "info" : "debug",
  format: winston.format.combine(
    winston.format.timestamp({
      format: "DD-MM-YYYY HH:mm:ss",
    }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json(),
    winston.format.colorize(),
  ),
  defaultMeta: { servicer: "api-monitoring" },
  transports: [
    new winston.transports.File({
      filename: "logs/errors.log",
      level: "error",
    }),
    new winston.transports.File({
      filename: "logs/combined.log",
    }),
  ],
});

if (config.nodeEnv !== "prodcution") {
  logger.add(
    new winston.transports.Console({
      format: winston.format.colorize(),
    }),
  );
}

export default logger;
