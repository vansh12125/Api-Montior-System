import { Router } from "express";
import { authRouter } from "../services/auth/routes/auth.routes.js";
import { clientRouter } from "../services/client/routes/client.routes.js";
import {ingestRouter} from "../services/ingest/routes/ingest.routes.js"

const routes = Router();

routes.use("/auth", authRouter);
routes.use("/client", clientRouter);
routes.use("/ingest", ingestRouter);

export default routes;
