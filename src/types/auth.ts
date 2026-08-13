export type OAuthProvider = "apple" | "google";

export type SupportedAuthMethod = "email" | "guest" | OAuthProvider;

export type ProfileKind = "customer" | "staff";

export type ProfileStatus = "active" | "closed" | "pending" | "suspended";

export type StaffRole = "customer_service" | "finance" | "operations" | "sales" | "super_admin";

export type IdentityPermission =
  | "identity.assignment.manage"
  | "identity.permission.read"
  | "identity.profile.manage"
  | "identity.profile.read"
  | "identity.role.read";

export type SalesWorkspacePermission = "sales.workspace.manage" | "sales.workspace.read";

export type OperationsWorkspacePermission =
  "operations.workspace.manage" | "operations.workspace.read";
