import express from "express";
import type { Express } from "express";
import cors from "cors";
import config from "./shared/constants";

const app: Express = express();

app.use(express.json());
app.use(
  cors({
    origin: config.frontendUrl,
    credentials: true,
  }),
);

export default app;
