import { Schema, model } from "mongoose";

import { API_METHODS } from "../enums/index.js";

const ApiHitSchema = new Schema(
  {
    eventId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    timestamp: {
      type: Date,
      required: true,
    },
    serviceName: {
      type: String,
      required: true,
      index: true,
    },
    endpoint: {
      type: String,
      required: true,
      index: true,
    },
    method: {
      type: String,
      required: true,
      enum: Object.values(API_METHODS),
      default: API_METHODS.GET,
    },
    statusCode: {
      type: Number,
      required: true,
      index: true,
    },
    latencyMs: {
      type: Number,
      required: true,
    },
    clientId: {
      type: Schema.Types.ObjectId,
      ref: "Client",
      required: true,
      index: true,
    },
    apikeyId: {
      type: Schema.Types.ObjectId,
      ref: "ApiKey",
      required: true,
      index: true,
    },
    ip: {
      type: String,
      required: true,
    },
    userAgent: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
    collection: "api_hits",
  },
);

ApiHitSchema.index({ clientId: 1, serviceName: 1, endpoint: 1, timestamp: -1 });
ApiHitSchema.index({ clientId: 1, timestamp: -1, statusCode: 1 });
ApiHitSchema.index({ apiKeyId: 1, timestamp: -1 });
ApiHitSchema.index({ timestamp: 1 }, { expireAfterSeconds: 2592000 });

const ApiHit = model("ApiHit", ApiHitSchema);

export { ApiHit };
