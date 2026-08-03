import { createClient } from "@supabase/supabase-js";
import { fileURLToPath } from "node:url";

export const bucketDefinitions = [
  {
    allowedMimeTypes: ["application/pdf", "image/jpeg", "image/png", "image/webp"],
    fileSizeLimit: 10 * 1024 * 1024,
    id: "attachments",
    public: false,
  },
  {
    allowedMimeTypes: ["image/avif", "image/jpeg", "image/png", "image/webp"],
    fileSizeLimit: 5 * 1024 * 1024,
    id: "public-assets",
    public: true,
  },
];

function normalizeMimeTypes(values) {
  return [...(values ?? [])].sort();
}

function hasConfigurationDrift(existingBucket, definition) {
  const existingMimeTypes = normalizeMimeTypes(existingBucket.allowed_mime_types);
  const expectedMimeTypes = normalizeMimeTypes(definition.allowedMimeTypes);

  return (
    existingBucket.public !== definition.public ||
    Number(existingBucket.file_size_limit) !== definition.fileSizeLimit ||
    JSON.stringify(existingMimeTypes) !== JSON.stringify(expectedMimeTypes)
  );
}

function getBucketOptions(definition) {
  return {
    allowedMimeTypes: [...definition.allowedMimeTypes],
    fileSizeLimit: definition.fileSizeLimit,
    public: definition.public,
  };
}

export async function reconcileStorageBuckets({ apply, logger = console, secretKey, supabaseUrl }) {
  if (!supabaseUrl?.trim() || !secretKey?.trim()) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY are required for storage initialization",
    );
  }

  const supabase = createClient(supabaseUrl.trim(), secretKey.trim(), {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false,
    },
  });

  const { data: existingBuckets, error: listError } = await supabase.storage.listBuckets();

  if (listError) {
    throw listError;
  }

  const changes = [];

  for (const definition of bucketDefinitions) {
    const existingBucket = existingBuckets.find((bucket) => bucket.id === definition.id);

    if (!existingBucket) {
      changes.push({ bucket: definition.id, operation: "create" });

      if (apply) {
        const { error } = await supabase.storage.createBucket(
          definition.id,
          getBucketOptions(definition),
        );

        if (error) {
          throw error;
        }

        logger.log(`Created storage bucket: ${definition.id}`);
      } else {
        logger.error(`Missing storage bucket: ${definition.id}`);
      }

      continue;
    }

    if (hasConfigurationDrift(existingBucket, definition)) {
      changes.push({ bucket: definition.id, operation: "update" });

      if (apply) {
        const { error } = await supabase.storage.updateBucket(
          definition.id,
          getBucketOptions(definition),
        );

        if (error) {
          throw error;
        }

        logger.log(`Updated storage bucket configuration: ${definition.id}`);
      } else {
        logger.error(`Storage bucket configuration differs: ${definition.id}`);
      }
    }
  }

  if (changes.length === 0) {
    logger.log("Storage bucket configuration is current.");
  }

  return { changes, hasDrift: changes.length > 0 };
}

async function runCommandLine() {
  const shouldApply = process.argv.includes("--apply");
  const shouldCheck = process.argv.includes("--check");

  if (shouldApply === shouldCheck) {
    throw new Error("Use exactly one mode: --check or --apply");
  }

  const result = await reconcileStorageBuckets({
    apply: shouldApply,
    secretKey: process.env.SUPABASE_SECRET_KEY,
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
  });

  if (shouldCheck && result.hasDrift) {
    process.exitCode = 1;
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  await runCommandLine();
}
