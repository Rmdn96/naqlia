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
    };
    Tables: {
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
    };
    Views: Record<never, never>;
  };
};
