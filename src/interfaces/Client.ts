import { ObjectId } from "mongoose";

interface ClientSettings {
  dataRetentionDays: number;
  alertsEnabled: boolean;
  timezone: string;
}

interface ClientModel {
  name: string;
  slug: string;
  email: string;
  description: string;
  website: string;
  createdBy: ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
  isActive: boolean;
  settings: ClientSettings;
}

export { ClientModel };
