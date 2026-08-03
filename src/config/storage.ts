import type { StorageBucketDefinition } from "@/types/supabase";

export const STORAGE_BUCKETS = [
  {
    access: "private",
    allowedMimeTypes: ["application/pdf", "image/jpeg", "image/png", "image/webp"],
    fileSizeLimit: 10 * 1024 * 1024,
    name: "attachments",
  },
  {
    access: "public",
    allowedMimeTypes: ["image/avif", "image/jpeg", "image/png", "image/webp"],
    fileSizeLimit: 5 * 1024 * 1024,
    name: "public-assets",
  },
] as const satisfies readonly StorageBucketDefinition[];
