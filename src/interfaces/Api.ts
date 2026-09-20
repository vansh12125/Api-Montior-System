import { ObjectId } from "mongoose";
import { API_METHODS } from "../enums";

type API_ENVIRONMENT = "production" | "staging" | "development" | "testing";

interface ApiKeyPermission {
  canIngest: boolean;
  canReadAnalytics: boolean;
  allowedServices: string[];
}

interface ApiKeySecurity {
  allowedIPs: string[];
  allowedOrigins: string[];
  lastRotated: Date;
  rotationWarningDays: number;
}

interface ApiKeyMetadata {
  createdBy?: ObjectId;
  purpose?: string;
  tags: string[];
}

interface ApiKeyModel {
  keyId: string;
  keyValue: string;
  clientId: ObjectId;
  name: string;
  description: string;
  environment: API_ENVIRONMENT;
  isActive: boolean;
  permissions: ApiKeyPermission;
  security: ApiKeySecurity;
  expiresAt: Date;
  metadata: ApiKeyMetadata;
  createdBy: ObjectId;
  isExpired: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

interface ApiHitModel {
  eventId: string;
  timestamp: Date;
  serviceName: string;
  endpoint: string;
  methods: API_METHODS;
  statusCode: number;
  latencyMs: number;
  clientId: ObjectId;
  apikeyId: ObjectId;
  ip: string;
  userAgent?: string;
}

export {
  ApiKeyModel,
  ApiKeyPermission,
  ApiKeySecurity,
  ApiKeyMetadata,
  ApiHitModel,
  API_METHODS,
};

export type { API_ENVIRONMENT };
