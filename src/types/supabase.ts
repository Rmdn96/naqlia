export type { Database, Json } from "@/types/database.types";

export type SupabasePublicEnvironment = {
  publishableKey: string;
  url: string;
};

export type SupabaseSecretEnvironment = SupabasePublicEnvironment & {
  secretKey: string;
};

export type StorageBucketAccess = "private" | "public";

export type StorageBucketDefinition = {
  access: StorageBucketAccess;
  allowedMimeTypes: readonly string[];
  fileSizeLimit: number;
  name: "attachments" | "public-assets";
};
