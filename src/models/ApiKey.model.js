import { Schema, model } from "mongoose";

import { API_ENIVORNMENT } from "../enums/index.js";
import { VALIDATION } from "../constants/validation.js";

const ApiKeySchema = new Schema(
  {
    keyValue: {
      type: String,
      required: true,
      unique: true,
      index: true,
      select:false
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
      minLength: [
        VALIDATION.NAME.MIN_LENGTH,
        `ApiKey name should be of minimum length, ${VALIDATION.NAME.MIN_LENGTH}`,
      ],
      maxLength: [
        VALIDATION.NAME.MAX_LENGTH,
        `ApiKey name should be of maximum length, ${VALIDATION.NAME.MAX_LENGTH}`,
      ],
    },

    description: {
      type: String,
      trim: true,

      minLength: [
        VALIDATION.DESCRIPTION.MIN_LENGTH,
        `Description name should be of minimum length, ${VALIDATION.DESCRIPTION.MIN_LENGTH}`,
      ],
      maxlength: [
        VALIDATION.DESCRIPTION.MAX_LENGTH,
        `Description should be of maximum length, ${VALIDATION.DESCRIPTION.MAX_LENGTH}`,
      ],
      required: true,
    },
    enivornment: {
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
  isActive: 1,
});

ApiKeySchema.index({
  enivornment: 1,
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
