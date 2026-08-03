export type Database = {
  public: {
    Tables: Record<never, never>;
    Views: Record<never, never>;
    Functions: Record<never, never>;
    Enums: Record<never, never>;
    CompositeTypes: Record<never, never>;
  };
};

export type SupabasePublicEnvironment = {
  publishableKey: string;
  url: string;
};

export type StorageBucketAccess = "private" | "public";

export type StorageBucketDefinition = {
  access: StorageBucketAccess;
  name: "attachments" | "public-assets";
};
