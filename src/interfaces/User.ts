import { Roles, UserPermissions } from "../enums";
import { ObjectId } from "mongoose";

interface UserModel {
  name: string;
  username: string;
  email: string;
  password?: string;
  role: Roles;
  isVerified?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  clientId: ObjectId;
  permissions: UserPermissions;
  isActive: boolean;
}

export { UserModel };
