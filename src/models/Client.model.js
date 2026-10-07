import { Schema, model } from "mongoose";

import { VALIDATION } from "../constants/validation.js";

const ClientSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minLength: [
        VALIDATION.CLIENT_NAME.MIN_LENGTH,
        `Client name should be of minimum length, ${VALIDATION.CLIENT_NAME.MIN_LENGTH}`,
      ],
      maxLength: [
        VALIDATION.CLIENT_NAME.MAX_LENGTH,
        `Client name should be of maximum length, ${VALIDATION.CLIENT_NAME.MAX_LENGTH}`,
      ],
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      minLength: [
        VALIDATION.SLUG.MIN_LENGTH,
        `Slug should be of minimum length, ${VALIDATION.SLUG.MIN_LENGTH}`,
      ],
      maxLength: [
        VALIDATION.SLUG.MAX_LENGTH,
        `Slug should be of maximum length, ${VALIDATION.SLUG.MAX_LENGTH}`,
      ],
      match: [
        VALIDATION.SLUG.PATTERN,
        "Slug can contain only lowercase letters, numbers, and hyphens",
      ],
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      maxLength: [
        VALIDATION.EMAIL.MAX_LENGTH,
        `Email should be of maximum length, ${VALIDATION.EMAIL.MAX_LENGTH}`,
      ],
      match: [VALIDATION.EMAIL.PATTERN, "Invalid email"],
    },

    description: {
      type: String,
      trim: true,
      maxLength: [
        VALIDATION.DESCRIPTION.MAX_LENGTH,
        `Description should be of maximum length, ${VALIDATION.DESCRIPTION.MAX_LENGTH}`,
      ],
      default: "",
    },

    website: {
      type: String,
      trim: true,
      maxLength: [
        VALIDATION.WEBSITE.MAX_LENGTH,
        `Website should be of maximum length, ${VALIDATION.WEBSITE.MAX_LENGTH}`,
      ],
      default: "",
    },

    isActive: {
      type: Boolean,
      required: true,
      default: true,
    },

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    settings: {
      dataRetentionDays: {
        type: Number,
        default: 30,
        min: VALIDATION.DATA_RETENTION.MIN_DAYS,
        max: VALIDATION.DATA_RETENTION.MAX_DAYS,
      },

      alertsEnabled: {
        type: Boolean,
        default: true,
      },

      timezone: {
        type: String,
        default: "UTC",
        trim: true,
      },
    },
  },
  {
    timestamps: true,
    collection: "clients",
  },
);

ClientSchema.index({ isActive: 1 });

const Client = model("Client", ClientSchema);

export { Client };
