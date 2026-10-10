import { Router } from "express";
import validateApiKeyMiddleware from "../../../middlewares/validateApiKey.middleware.js";

const ingestRouter = Router();

ingestRouter.get("/test", validateApiKeyMiddleware, (req, res) => {
  res.status(200).json({
    success: true,
    message: "API key verified successfully",
    data: req.apiKey,
  });
});

export  {ingestRouter};