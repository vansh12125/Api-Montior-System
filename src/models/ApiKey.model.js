import { Schema, model } from "mongoose";

import { API_ENIVORNMENT } from "../enums/index.js";

const ApiKeySchema = new Schema(
  {
    keyId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    keyValue: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    clientId: {
      type: Schema.Types.ObjectId,
      ref: "Client",
      required: true,
      index: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    description: {
      type: String,
      maxlength: 500,
      default: "",
    },
    environment: {
      type: String,
      enum: Object.values(API_ENIVORNMENT),
      default: API_ENIVORNMENT.DEVELOPMENT,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    permissions: {
      canIngest: {
        type: Boolean,
        default: true,
      },

      canReadAnalytics: {
        type: Boolean,
        default: false,
      },

      allowedServices: {
        type: [String],
        default: [],
      },
    },
    security: {
      allowedIPs: {
        type: [String],
        default: [],
        validate: {
          validator: (ips) =>
            ips.every(
              (ip) =>
                /^(\d{1,3}\.){3}\d{1,3}(\/\d{1,2})?$/.test(ip) ||
                ip === "0.0.0.0/0",
            ),
          message: "Invalid IP address format",
        },
      },
      allowedOrigins: {
        type: [String],
        default: [],
        validate: {
          validator: (origins) =>
            origins.every(
              (origin) => /^https?:\/\/[^\s]+$/.test(origin) || origin === "*",
            ),
          message: "Invalid origin format",
        },
      },

      lastRotated: {
        type: Date,
        default: Date.now,
      },

      rotationWarningDays: {
        type: Number,
        default: 30,
      },
    },

    expiresAt: {
      type: Date,
      default: () => {
        const days = parseInt(process.env.API_KEY_EXPIRY_DAYS || "365", 10);

        return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
      },
    },

    metadata: {
      createdBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
      },

      purpose: {
        type: String,
        trim: true,
        maxlength: 200,
      },

      tags: {
        type: [String],
        default: [],
      },
    },

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
    collection: "api_keys",
  },
);

ApiKeySchema.index({
  clientId: 1,
  isActive: 1,
});

ApiKeySchema.index({
  keyValue: 1,
  isActive: 1,
});

ApiKeySchema.index({
  environment: 1,
  clientId: 1,
});

ApiKeySchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

ApiKeySchema.methods.isExpired = function () {
  if (!this.expiresAt) {
    return false;
  }

  return this.expiresAt.getTime() < Date.now();
};

const ApiKey = model("ApiKey", ApiKeySchema);

export { ApiKey };
