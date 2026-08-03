import { createClient } from "@supabase/supabase-js";

const bucketDefinitions = [
  { id: "attachments", public: false },
  { id: "public-assets", public: true },
];

const shouldApply = process.argv.includes("--apply");
const shouldCheck = process.argv.includes("--check");

if (shouldApply === shouldCheck) {
  throw new Error("Use exactly one mode: --check or --apply");
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const secretKey = process.env.SUPABASE_SECRET_KEY?.trim();

if (!supabaseUrl || !secretKey) {
  throw new Error(
    "NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY are required for storage initialization",
  );
}

const supabase = createClient(supabaseUrl, secretKey, {
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

let hasDrift = false;

for (const definition of bucketDefinitions) {
  const existingBucket = existingBuckets.find((bucket) => bucket.id === definition.id);

  if (!existingBucket) {
    hasDrift = true;

    if (shouldApply) {
      const { error } = await supabase.storage.createBucket(definition.id, {
        public: definition.public,
      });

      if (error) {
        throw error;
      }

      console.log(`Created storage bucket: ${definition.id}`);
    } else {
      console.error(`Missing storage bucket: ${definition.id}`);
    }

    continue;
  }

  if (existingBucket.public !== definition.public) {
    hasDrift = true;

    if (shouldApply) {
      const { error } = await supabase.storage.updateBucket(definition.id, {
        public: definition.public,
      });

      if (error) {
        throw error;
      }

      console.log(`Updated storage bucket access: ${definition.id}`);
    } else {
      console.error(`Storage bucket access differs: ${definition.id}`);
    }
  }
}

if (shouldCheck && hasDrift) {
  process.exitCode = 1;
} else if (!hasDrift) {
  console.log("Storage bucket configuration is current.");
}
