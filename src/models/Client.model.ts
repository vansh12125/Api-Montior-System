import { Schema, model, Model, HydratedDocument } from "mongoose";
import { ClientModel } from "../interfaces";

type ClientDocument = HydratedDocument<ClientModel>;

const ClientSchema: Schema<ClientModel> = new Schema<ClientModel>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minLength: [2, "Name Should be of minimun length, 2"],
      maxLength: [100, "Name Should be of maximum length, 100"],
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      match: /^[a-z0-9-]+$/,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        "Invalid Email",
      ],
    },
    description: {
      type: String,
      maxlength: 500,
      default: "",
    },
    website: {
      type: String,
      default: "",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "Users",
      required: true,
    },
    settings: {
      dataRetentionDays: {
        type: Number,
        default: 30,
        min: 7,
        max: 365,
      },
      alertsEnabled: {
        type: Boolean,
        default: true,
      },
      timezone: {
        type: String,
        default: "UTC",
      },
    },
  },
  {
    timestamps: true,
    collection: "clients",
  },
);

const Client: Model<ClientModel> = model<ClientModel>("Clients", ClientSchema);
ClientSchema.index({ isActive: 1 });

export { ClientModel, Client, ClientDocument };
