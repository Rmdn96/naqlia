export type Json = boolean | null | number | string | Json[] | { [key: string]: Json | undefined };

type ProfileRow = {
  auth_user_id: string | null;
  created_at: string;
  display_name: string | null;
  id: string;
  preferred_locale: "ar" | "en";
  profile_kind: "customer" | "staff";
  status: "active" | "closed" | "pending" | "suspended";
  status_changed_at: string;
  status_reason: string | null;
  updated_at: string;
  version: number;
};

type RoleRow = {
  created_at: string;
  description_ar: string;
  description_en: string;
  id: string;
  is_system: boolean;
  name_ar: string;
  name_en: string;
  role_key: string;
  status: "active" | "retired";
  updated_at: string;
};

type PermissionRow = {
  created_at: string;
  description_ar: string;
  description_en: string;
  id: string;
  permission_key: string;
  risk_level: "critical" | "high" | "low" | "medium";
  status: "active" | "deprecated" | "retired";
  updated_at: string;
};

type RolePermissionRow = {
  grant_reason: string;
  granted_at: string;
  granted_by_profile_id: string | null;
  id: string;
  permission_id: string;
  revocation_reason: string | null;
  revoked_at: string | null;
  revoked_by_profile_id: string | null;
  role_id: string;
  status: "active" | "revoked";
};

type ProfileRoleRow = {
  grant_reason: string;
  granted_at: string;
  granted_by_profile_id: string | null;
  id: string;
  profile_id: string;
  revocation_reason: string | null;
  revoked_at: string | null;
  revoked_by_profile_id: string | null;
  role_id: string;
  status: "active" | "revoked";
};

type AuditFields = {
  created_at: string;
  created_by_profile_id: string | null;
  updated_at: string;
  updated_by_profile_id: string | null;
};

type SoftDeleteFields = {
  deleted_at: string | null;
  deleted_by_profile_id: string | null;
  deletion_reason: string | null;
};

type CityRow = AuditFields &
  SoftDeleteFields & {
    city_code: string;
    country_code: "SA";
    display_order: number;
    id: string;
    name_ar: string;
    name_en: string;
    region_ar: string;
    region_en: string;
    slug: string;
    status: "active" | "inactive";
  };

type ServiceRow = AuditFields &
  SoftDeleteFields & {
    description_ar: string;
    description_en: string;
    display_order: number;
    id: string;
    name_ar: string;
    name_en: string;
    service_key: string;
    status: "active" | "inactive";
    transport_scope: "both" | "intercity" | "local";
  };

type ServiceOptionRow = AuditFields &
  SoftDeleteFields & {
    description_ar: string;
    description_en: string;
    display_order: number;
    id: string;
    name_ar: string;
    name_en: string;
    option_key: string;
    service_id: string | null;
    status: "active" | "inactive";
  };

type AddressRow = AuditFields &
  SoftDeleteFields & {
    building_number: string | null;
    city_id: string;
    district: string | null;
    formatted_address: string;
    id: string;
    landmark: string | null;
    latitude: number | null;
    location_precision: "approximate" | "city_center" | "exact" | null;
    location_provider: "geocoded" | "google_maps" | "manual";
    longitude: number | null;
    postal_code: string | null;
    profile_id: string | null;
    provider_place_id: string | null;
    route_access_notes: string | null;
    street_name: string | null;
    unit_number: string | null;
  };

type LeadRow = AuditFields & {
  cargo_description: string | null;
  cargo_quantity: number | null;
  closed_at: string | null;
  customer_name: string;
  customer_notes: string | null;
  delivery_address_id: string;
  email: string | null;
  id: string;
  internal_notes: string | null;
  mobile_number: string;
  pickup_address_id: string;
  preferred_locale: "ar" | "en";
  privacy_consent_version: string | null;
  privacy_consented_at: string | null;
  profile_id: string | null;
  qualified_at: string | null;
  reference_number: string;
  requested_service_option_ids: string[];
  service_id: string;
  service_options_snapshot: Json;
  service_snapshot: Json;
  source: "admin" | "phone" | "web";
  status: "cancelled" | "closed" | "converted" | "new" | "qualified" | "quoted";
  submitted_at: string;
  submission_key: string | null;
};

type LeadAttachmentRow = AuditFields &
  SoftDeleteFields & {
    checksum_sha256: string | null;
    id: string;
    lead_id: string;
    mime_type: "application/pdf" | "image/jpeg" | "image/png" | "image/webp";
    original_filename: string;
    owner_entity_type: "lead";
    size_bytes: number;
    status: "available" | "pending" | "quarantined" | "removed";
    storage_bucket: "attachments";
    storage_path: string;
    uploaded_at: string;
  };

type QuotationRow = AuditFields & {
  approved_at: string | null;
  approved_by_profile_id: string | null;
  currency: string;
  customer_notes: string | null;
  expires_at: string;
  id: string;
  internal_notes: string | null;
  lead_id: string;
  quotation_number: string;
  quoted_amount: number;
  revision_number: number;
  sent_at: string | null;
  status: "approved" | "cancelled" | "draft" | "expired" | "rejected" | "sent" | "superseded";
  subtotal_amount: number;
  tax_amount: number;
  terms_ar: string;
  terms_en: string;
};

type OrderRow = AuditFields & {
  completed_at: string | null;
  currency: string;
  execution_started_at: string | null;
  execution_status: "cancelled" | "completed" | "created" | "in_progress" | "scheduled";
  id: string;
  operational_notes: string | null;
  order_number: string;
  quotation_id: string;
  schedule_timezone: "Asia/Riyadh";
  scheduled_for: string | null;
  subtotal_amount: number;
  tax_amount: number;
  total_amount: number;
  tracking_mobile_number: string;
};

type InsertWithRequired<Row, RequiredKeys extends keyof Row> = Partial<Row> &
  Pick<Row, RequiredKeys>;

export type Database = {
  public: {
    CompositeTypes: Record<never, never>;
    Enums: Record<never, never>;
    Functions: {
      assign_staff_role: {
        Args: {
          change_reason: string;
          target_profile_id: string;
          target_role_key: string;
        };
        Returns: string;
      };
      current_profile_id: {
        Args: Record<never, never>;
        Returns: string | null;
      };
      has_permission: {
        Args: { requested_permission: string };
        Returns: boolean;
      };
      provision_staff_identity: {
        Args: {
          change_reason: string;
          target_auth_user_id: string;
          target_display_name: string;
          target_role_key: string;
        };
        Returns: string;
      };
      revoke_staff_role: {
        Args: { change_reason: string; target_profile_id: string };
        Returns: boolean;
      };
      set_profile_status: {
        Args: {
          change_reason: string;
          target_profile_id: string;
          target_status: string;
        };
        Returns: boolean;
      };
      submit_guest_service_request: {
        Args: {
          attachment_payload?: Json;
          request_payload: Json;
        };
        Returns: Array<{
          lead_id: string;
          reference_number: string;
        }>;
      };
    };
    Tables: {
      addresses: {
        Insert: InsertWithRequired<AddressRow, "city_id" | "formatted_address">;
        Relationships: [];
        Row: AddressRow;
        Update: Partial<AddressRow>;
      };
      cities: {
        Insert: InsertWithRequired<
          CityRow,
          "city_code" | "name_ar" | "name_en" | "region_ar" | "region_en" | "slug"
        >;
        Relationships: [];
        Row: CityRow;
        Update: Partial<CityRow>;
      };
      lead_attachments: {
        Insert: InsertWithRequired<
          LeadAttachmentRow,
          "lead_id" | "mime_type" | "original_filename" | "size_bytes" | "storage_path"
        >;
        Relationships: [];
        Row: LeadAttachmentRow;
        Update: Partial<LeadAttachmentRow>;
      };
      leads: {
        Insert: InsertWithRequired<
          LeadRow,
          | "customer_name"
          | "delivery_address_id"
          | "mobile_number"
          | "pickup_address_id"
          | "service_id"
        >;
        Relationships: [];
        Row: LeadRow;
        Update: Partial<LeadRow>;
      };
      orders: {
        Insert: InsertWithRequired<
          OrderRow,
          | "currency"
          | "quotation_id"
          | "subtotal_amount"
          | "tax_amount"
          | "total_amount"
          | "tracking_mobile_number"
        >;
        Relationships: [];
        Row: OrderRow;
        Update: Partial<OrderRow>;
      };
      permissions: {
        Insert: {
          created_at?: string;
          description_ar: string;
          description_en: string;
          id?: string;
          permission_key: string;
          risk_level: PermissionRow["risk_level"];
          status?: PermissionRow["status"];
          updated_at?: string;
        };
        Relationships: [];
        Row: PermissionRow;
        Update: Partial<PermissionRow>;
      };
      profile_roles: {
        Insert: {
          grant_reason: string;
          granted_at?: string;
          granted_by_profile_id?: string | null;
          id?: string;
          profile_id: string;
          revocation_reason?: string | null;
          revoked_at?: string | null;
          revoked_by_profile_id?: string | null;
          role_id: string;
          status?: ProfileRoleRow["status"];
        };
        Relationships: [];
        Row: ProfileRoleRow;
        Update: Partial<ProfileRoleRow>;
      };
      profiles: {
        Insert: {
          auth_user_id?: string | null;
          created_at?: string;
          display_name?: string | null;
          id?: string;
          preferred_locale?: ProfileRow["preferred_locale"];
          profile_kind?: ProfileRow["profile_kind"];
          status?: ProfileRow["status"];
          status_changed_at?: string;
          status_reason?: string | null;
          updated_at?: string;
          version?: number;
        };
        Relationships: [];
        Row: ProfileRow;
        Update: Partial<ProfileRow>;
      };
      quotations: {
        Insert: InsertWithRequired<
          QuotationRow,
          "expires_at" | "lead_id" | "quoted_amount" | "subtotal_amount" | "terms_ar" | "terms_en"
        >;
        Relationships: [];
        Row: QuotationRow;
        Update: Partial<QuotationRow>;
      };
      role_permissions: {
        Insert: {
          grant_reason: string;
          granted_at?: string;
          granted_by_profile_id?: string | null;
          id?: string;
          permission_id: string;
          revocation_reason?: string | null;
          revoked_at?: string | null;
          revoked_by_profile_id?: string | null;
          role_id: string;
          status?: RolePermissionRow["status"];
        };
        Relationships: [];
        Row: RolePermissionRow;
        Update: Partial<RolePermissionRow>;
      };
      roles: {
        Insert: {
          created_at?: string;
          description_ar: string;
          description_en: string;
          id?: string;
          is_system?: boolean;
          name_ar: string;
          name_en: string;
          role_key: string;
          status?: RoleRow["status"];
          updated_at?: string;
        };
        Relationships: [];
        Row: RoleRow;
        Update: Partial<RoleRow>;
      };
      service_options: {
        Insert: InsertWithRequired<
          ServiceOptionRow,
          "description_ar" | "description_en" | "name_ar" | "name_en" | "option_key"
        >;
        Relationships: [];
        Row: ServiceOptionRow;
        Update: Partial<ServiceOptionRow>;
      };
      services: {
        Insert: InsertWithRequired<
          ServiceRow,
          | "description_ar"
          | "description_en"
          | "name_ar"
          | "name_en"
          | "service_key"
          | "transport_scope"
        >;
        Relationships: [];
        Row: ServiceRow;
        Update: Partial<ServiceRow>;
      };
    };
    Views: Record<never, never>;
  };
};
