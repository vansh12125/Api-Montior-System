import { Schema, model } from "mongoose";

import { Roles } from "../enums/index.js";
import { VALIDATION } from "../constants/validation.js";

const UserSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minLength: [
        VALIDATION.NAME.MIN_LENGTH,
        `Name should be of minimum length, ${VALIDATION.NAME.MIN_LENGTH}`,
      ],
      maxLength: [
        VALIDATION.NAME.MAX_LENGTH,
        `Name should be of maximum length, ${VALIDATION.NAME.MAX_LENGTH}`,
      ],
    },

    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      minLength: [
        VALIDATION.USERNAME.MIN_LENGTH,
        `Username should be of minimum length, ${VALIDATION.USERNAME.MIN_LENGTH}`,
      ],
      maxLength: [
        VALIDATION.USERNAME.MAX_LENGTH,
        `Username should be of maximum length, ${VALIDATION.USERNAME.MAX_LENGTH}`,
      ],
      match: [
        VALIDATION.USERNAME.PATTERN,
        "Username must start with a letter and contain only letters, numbers, or underscores",
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

    password: {
      type: String,
      required: true,
      minLength: [
        VALIDATION.PASSWORD.MIN_LENGTH,
        `Password should be of minimum length, ${VALIDATION.PASSWORD.MIN_LENGTH}`,
      ],
      maxLength: [
        VALIDATION.PASSWORD.MAX_LENGTH,
        `Password should be of maximum length, ${VALIDATION.PASSWORD.MAX_LENGTH}`,
      ],
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
      ref: "Client",
      default:null,
      // required: function () {
      //   return this.role !== Roles.SUPER_ADMIN;
      // },
    },

    isActive: {
      type: Boolean,
      required: true,
      default: true,
    },
  },
  {
    timestamps: true,
    collection: "users",

    toJSON: {
      transform: function (doc, ret) {
        const { password, __v, ...user } = ret;
        return user;
      },
    },
  },
);

UserSchema.index({
  clientId: 1,
  isActive: 1,
});

UserSchema.index(
  { role: 1 },
  {
    unique: true,
    partialFilterExpression: {
      role: Roles.SUPER_ADMIN,
    },
  },
);

const User = model("User", UserSchema);

export { User };
