import { Router } from "express";
import { authRouter } from "../services/auth/routes/auth.routes.js";
import { clientRouter } from "../services/client/routes/client.routes.js";
import { ingestRouter } from "../services/ingest/routes/ingest.routes.js";
import { analyticsRouter } from "../services/analytics/routes/analytics.routes.js";
import { rateLimit } from "express-rate-limit";
import config from "../constants/index.js";
import { ResponseFormatter } from "../utils/index.js";

const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  limit: config.rateLimit.maxRequests,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  handler: (_req, res) => {
    return res.status(429).json(
      ResponseFormatter.error(
        429,
        "Too many requests. Please try again later.",
        {
          code: "TOO_MANY_REQUESTS",
        },
      ),
    );
  },
});

const ingestLimiter = rateLimit({
  windowMs: config.rateLimit.ingestionLimit.windowMs,
  limit: config.rateLimit.ingestionLimit.maxRequests,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  handler: (_req, res) => {
    return res.status(429).json(
      ResponseFormatter.error(
        429,
        "Ingestion rate limit exceeded. Please try again later.",
        {
          code: "TOO_MANY_REQUESTS",
        },
      ),
    );
  },
});

const routes = Router();

routes.use("/auth", limiter, authRouter);
routes.use("/client", limiter, clientRouter);
routes.use("/ingest", ingestLimiter, ingestRouter);
routes.use("/analytics", limiter, analyticsRouter);

export default routes;
