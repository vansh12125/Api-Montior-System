import mongoose, { Schema, model, Model, HydratedDocument } from "mongoose";
import { UserModel } from "../interfaces";
import { Roles } from "../enums";

type UserDocument = HydratedDocument<UserModel>;

const UserSchema: Schema<UserModel> = new Schema<UserModel>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minLength: [3, "Name Should be of minimun length, 3"],
      maxLength: [50, "Name Should be of maximum length, 50"],
    },
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minLength: [3, "Username Should be of minimun length, 3"],
      maxLength: [25, "Username Should be of maximum length, 25"],
      match: [
        /^[a-zA-Z][a-zA-Z0-9_]{2,19}$/,
        "Username must start with a letter and contain only letters, numbers, or underscores",
      ],
      lowercase: true,
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
    password: {
      type: String,
      minLength: [8, "Passoword Should be of minimun length, 8"],
      select: false,
    },
    role: {
      type: String,
      required: true,
      enum: Object.values(Roles),
      default: Roles.CLIENT_VIEWER,
    },
    isVerified: {
      type: Boolean,
      required: true,
      default: false,
    },
    clientId: {
      type: Schema.Types.ObjectId,
      ref: "Clients",
      required: function (): boolean {
        return this.role !== Roles.SUPER_ADMIN;
      },
    },
    permissions: {
      canCreateApiKeys: {
        type: Boolean,
        default: false,
      },
      canManageUsers: {
        type: Boolean,
        default: false,
      },
      canViewAnalytics: {
        type: Boolean,
        default: true,
      },
      canExportData: {
        type: Boolean,
        default: false,
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    collection: "Users",
    toJSON: {
      transform: function (doc, ret) {
        const { password, __v, ...user } = ret as UserModel & {
          password: string;
          __v: number;
        };

        return user;
      },
    },
  },
);

const User: Model<UserModel> = model<UserModel>("Users", UserSchema);
UserSchema.index({ clientId: 1, isActive: 1 });
UserSchema.index({ role: 1 });

export { UserModel, User, UserDocument };
