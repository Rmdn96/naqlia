import type { StorageBucketDefinition } from "@/types/supabase";

export const STORAGE_BUCKETS = [
  {
    access: "private",
    name: "attachments",
  },
  {
    access: "public",
    name: "public-assets",
  },
] as const satisfies readonly StorageBucketDefinition[];
