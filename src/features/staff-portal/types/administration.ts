export type BusinessSettingsPayload = {
  service_areas: Array<{
    city_code: string;
    display_order: number;
    id: string;
    name_ar: string;
    name_en: string;
    status: "active" | "inactive";
  }>;
  settings: Array<{
    category: string;
    is_public: boolean;
    setting_key: string;
    updated_at: string;
    value_text: string | null;
    version: number;
  }>;
};

export type UserListPayload = {
  items: Array<{
    created_at: string;
    display_name: string | null;
    email: string;
    id: string;
    invitation_id: string | null;
    invitation_status: string | null;
    last_login_at: string | null;
    last_sent_at: string | null;
    role_key: string | null;
    staff_access_status: string;
    status: string;
  }>;
  page: number;
  page_size: number;
  total: number;
};

export type RolePermissionItem = {
  name_ar: string;
  name_en: string;
  permissions: string[];
  role_key: string;
};

export type ActivityPayload = {
  items: Array<{
    actor_name: string | null;
    details: Record<string, unknown>;
    event_key: string;
    functional_area: string;
    id: string;
    occurred_at: string;
    reference_number: string | null;
    subject_type: string | null;
  }>;
  page: number;
  page_size: number;
  total: number;
};
