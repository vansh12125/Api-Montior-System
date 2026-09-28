const Roles = Object.freeze({
  SUPER_ADMIN: "SUPER_ADMIN",
  CLIENT_ADMIN: "CLIENT_ADMIN",
  CLIENT_VIEWER: "CLIENT_VIEWER",
});

const ROLE_PERMISSIONS = {
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

export { Roles, ROLE_PERMISSIONS };
