import type { IdentityPermission, StaffRole } from "@/types/auth";

export type PortalContext = {
  display_name: string | null;
  has_customer_account: boolean;
  permissions: IdentityPermission[];
  profile_id: string;
  role_key: StaffRole;
  unread_count: number;
};

export type PortalDashboard = {
  actions: Array<{ count: number; key: string; path: string }>;
  metrics: Record<string, number>;
  role_key: StaffRole;
};

export type PortalSearchResult = {
  kind: "job" | "lead" | "order" | "review";
  label: string;
  path: string;
  reference_number: string;
};

export type PortalNotification = {
  event_key: string;
  functional_area: string;
  id: string;
  is_read: boolean;
  occurred_at: string;
  path: string;
  reference_number: string | null;
};
