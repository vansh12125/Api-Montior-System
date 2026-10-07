import { Schema, model } from "mongoose";

import { Roles } from "../enums/index.js";

const clientInfoSchema = new Schema(
  {
    ipAddress: {
      type: String,
      required: true,
    },

    browser: {
      type: String,
      required: true,
    },

    browserVersion: {
      type: String,
      required: true,
    },

    os: {
      type: String,
      required: true,
    },

    osVersion: {
      type: String,
      required: true,
    },

    device: {
      type: String,
      required: true,
    },
  },
  {
    _id: false,
  },
);

const refreshTokenSchema = new Schema(
  {
    tokenHash: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    sessionId: {
      type: String,
      required: true,
      index: true,
    },

    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    role: {
      type: String,
      required: true,
      enum: Object.values(Roles),
      default: Roles.CLIENT_VIEWER,
    },

    revoked: {
      type: Boolean,
      required: true,
      default: false,
    },

    expireAt: {
      type: Date,
      required: true,
    },

    clientInfo: {
      type: clientInfoSchema,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

refreshTokenSchema.index({ expireAt: 1 }, { expireAfterSeconds: 0 });

const RefreshToken = model("RefreshToken", refreshTokenSchema);

export { RefreshToken };
