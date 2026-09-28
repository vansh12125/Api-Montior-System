import { Router } from "express";
import {authRouter} from "../services/auth/routes/auth.routes.js"

const routes = Router();

routes.use("/auth",authRouter);

export default routes;
