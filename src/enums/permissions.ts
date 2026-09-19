import { Roles } from "../enums";

interface UserPermissions {
  canCreateApiKeys: boolean;
  canManageUsers: boolean;
  canViewAnalytics: boolean;
  canExportData: boolean;
}

const ROLE_PERMISSIONS: Record<Roles, UserPermissions> = {
  [Roles.SUPER_ADMIN]: {
    canCreateApiKeys: true,
    canManageUsers: true,
    canViewAnalytics: true,
    canExportData: true,
  },

  [Roles.CLIENT_ADMIN]: {
    canCreateApiKeys: true,
    canManageUsers: true,
    canViewAnalytics: true,
    canExportData: true,
  },

  [Roles.CLIENT_VIEWER]: {
    canCreateApiKeys: false,
    canManageUsers: false,
    canViewAnalytics: true,
    canExportData: false,
  },
};

export { ROLE_PERMISSIONS };
export type { UserPermissions };