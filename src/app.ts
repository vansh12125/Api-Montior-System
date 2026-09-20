import express from "express";
import type { Express, Request, Response, NextFunction } from "express";
import cors from "cors";
import config from "./constants";
import helmet from "helmet";
import routes from "./routes";
import { logger, initializeConnection, disconnectConnection } from "./config";
import { ResponseFormatter } from "./utils";

/**Initialized express app */
const app: Express = express();

/**
 * All middlewares
 */
app.use(helmet());
app.use(express.json());
app.use(
  cors({
    origin: config.server.frontendUrl,
    credentials: true,
  }),
);
app.use(express.urlencoded({ extended: true }));

/**
 * Request logging middleware
 * Logs the HTTP method, path, IP address, and user agent for each incoming request.
 */
app.use((req: Request, res: Response, next: NextFunction) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.headers["user-agent"],
  });
  next();
});

/**
 * Root endpoint
 * Provides basic information about the API service and available endpoints.
 */
app.get("/", (req: Request, res: Response) => {
  res.status(200).json(
    ResponseFormatter.success(200, "API Hit Monitoring Service", {
      service: "API Hit Monitoring System",
      version: "1.0.0",
      endpoints: {
        health: "/health",
        auth: "/api/auth",
        ingest: "/api/hit",
        analytics: "/api/analytics",
      },
    }),
  );
});

app.get("/health", (req: Request, res: Response) => {
  res.status(200).json(
    ResponseFormatter.success(200, "Server is healthy", {
      status: "Healty",
      uptime: process.uptime(),
    }),
  );
});

app.use(`/api/${config.server.apiVersion}`, routes);

/**
 * 404 Handler
 */
app.use((req: Request, res: Response) => {
  res
    .status(404)
    .json(
      ResponseFormatter.error(404, "Endpoint Not Found", "Endpoint Not Found"),
    );
});

/**
 * Start the Express server after establishing database connections.
 * Also sets up graceful shutdown handlers for SIGINT and SIGTERM signals.
 * On shutdown, it closes the HTTP server and all database connections before exiting the process.
 * If any error occurs during startup or shutdown, it logs the error and exits with a non-zero status code.
 */
async function startServer() {
  try {
    await initializeConnection();

    const server = app.listen(config.server.port, () => {
      logger.info(`Server started on port ${config.server.port}`);
      logger.info(`Environment: ${config.nodeEnv}`);
      logger.info(`API available at: http://localhost:${config.server.port}`);
    });

    const gracefulShutdown = async (signal: string) => {
      logger.info(`${signal} received, shutting down gracefully...`);

      server.close(async () => {
        logger.info("HTTP server closed");

        try {
          await disconnectConnection();
        } catch (error) {
          logger.error("Error during shutdown:", error);
          process.exit(1);
        }
      });

      setTimeout(() => {
        logger.error("Forced shutdown");
        process.exit(1);
      }, 10000);
    };

    process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
    process.on("SIGINT", () => gracefulShutdown("SIGINT"));

    // Handle uncaught exceptions
    process.on("uncaughtException", (error) => {
      logger.error("Uncaught Exception:", error);
      gracefulShutdown("uncaughtException");
    });

    process.on("unhandledRejection", (reason, promise) => {
      logger.error("Unhandled Rejection at:", promise, "reason:", reason);
      gracefulShutdown("unhandledRejection");
    });
  } catch (error) {
    logger.error("Failed to start server:", error);
    process.exit(1);
  }
}

export default startServer;
