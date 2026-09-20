import { Schema, model, type Model, type HydratedDocument } from "mongoose";

import type { ApiKeyModel, API_ENVIRONMENT } from "../interfaces";

type ApiKeyDocument = HydratedDocument<ApiKeyModel>;

const ApiKeySchema = new Schema<ApiKeyModel>(
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
      enum: [
        "production",
        "staging",
        "development",
        "testing",
      ] satisfies API_ENVIRONMENT[],
      default: "production",
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
          validator: (ips: string[]) =>
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
          validator: (origins: string[]) =>
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
      index: true,
    },

    metadata: {
      createdBy: {
        type: Schema.Types.ObjectId,
        ref: "Users",
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
      ref: "Users",
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

ApiKeySchema.methods.isExpired = function (): boolean {
  if (!this.expiresAt) {
    return false;
  }

  return this.expiresAt.getTime() < Date.now();
};

const ApiKey: Model<ApiKeyModel> = model<ApiKeyModel>("ApiKey", ApiKeySchema);

export { ApiKey, ApiKeySchema };

export type { ApiKeyDocument };
