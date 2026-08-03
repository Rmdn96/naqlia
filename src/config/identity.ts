import type { IdentityPermission, StaffRole } from "@/types/auth";

export const STAFF_ROLES = [
  "super_admin",
  "sales",
  "operations",
  "finance",
  "customer_service",
] as const satisfies readonly StaffRole[];

export const IDENTITY_PERMISSIONS = [
  "identity.profile.read",
  "identity.profile.manage",
  "identity.role.read",
  "identity.permission.read",
  "identity.assignment.manage",
] as const satisfies readonly IdentityPermission[];
