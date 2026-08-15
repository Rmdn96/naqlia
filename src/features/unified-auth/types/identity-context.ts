import type { IdentityPermission, StaffRole } from "@/types/auth";

export type IdentityContext = {
  customer_account_id: string;
  display_name: string | null;
  is_staff: boolean;
  permissions: IdentityPermission[];
  preferred_locale: "ar" | "en";
  profile_id: string;
  role_key: StaffRole | null;
  state: "active";
};
