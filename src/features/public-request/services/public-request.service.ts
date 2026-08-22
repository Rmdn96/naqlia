import "server-only";

import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { AppLocale } from "@/i18n/routing";
import type { Json } from "@/types/supabase";
import {
  completedUploadsSchema,
  isHumanSubmission,
  publicRequestPayloadSchema,
  publicUploadDescriptorsSchema,
} from "@/features/public-request/lib/validation";
import { PUBLIC_REQUEST_CONSENT_VERSION } from "@/config/public-request";
import type {
  CompletePublicRequestResult,
  CompletedUpload,
  PreparePublicRequestResult,
  PublicRequestCatalog,
  PublicRequestPayload,
  PublicUploadDescriptor,
} from "@/features/public-request/types/public-request";

const ATTACHMENTS_BUCKET = "attachments";

const FILE_EXTENSIONS = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
} as const;

function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[\\/\u0000-\u001f\u007f]/g, "-")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 255);
}

function isOwnedUploadPath(path: string, submissionId: string): boolean {
  return path.startsWith(`guest/${submissionId}/`) && !path.includes("..") && !path.includes("//");
}

async function findExistingSubmission(submissionId: string) {
  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from("leads")
    .select("reference_number")
    .eq("submission_key", submissionId)
    .maybeSingle();

  if (error) {
    throw new Error("PUBLIC_REQUEST_LOOKUP_FAILED", { cause: error });
  }

  return data?.reference_number ?? null;
}

export async function getPublicRequestCatalog(locale: AppLocale): Promise<PublicRequestCatalog> {
  const supabase = await createServerSupabaseClient();
  const [citiesResult, servicesResult, optionsResult] = await Promise.all([
    supabase
      .from("cities")
      .select("id, name_ar, name_en, region_ar, region_en, slug")
      .eq("status", "active")
      .is("deleted_at", null)
      .order("display_order")
      .order(locale === "ar" ? "name_ar" : "name_en"),
    supabase
      .from("services")
      .select("id, service_key, name_ar, name_en, description_ar, description_en, transport_scope")
      .eq("status", "active")
      .is("deleted_at", null)
      .order("display_order"),
    supabase
      .from("service_options")
      .select("id, service_id, name_ar, name_en")
      .eq("status", "active")
      .is("deleted_at", null)
      .order("display_order"),
  ]);

  if (citiesResult.error || servicesResult.error || optionsResult.error) {
    throw new Error("PUBLIC_REQUEST_CATALOG_UNAVAILABLE");
  }

  return {
    cities: citiesResult.data.map((city) => ({
      id: city.id,
      name: locale === "ar" ? city.name_ar : city.name_en,
      region: locale === "ar" ? city.region_ar : city.region_en,
      slug: city.slug,
    })),
    options: optionsResult.data.map((option) => ({
      id: option.id,
      name: locale === "ar" ? option.name_ar : option.name_en,
      serviceId: option.service_id,
    })),
    services: servicesResult.data.map((service) => ({
      description: locale === "ar" ? service.description_ar : service.description_en,
      id: service.id,
      key: service.service_key,
      name: locale === "ar" ? service.name_ar : service.name_en,
      scope: service.transport_scope,
    })),
  };
}

export async function preparePublicRequest(
  rawPayload: unknown,
  rawFiles: unknown,
): Promise<PreparePublicRequestResult> {
  const payloadResult = publicRequestPayloadSchema.safeParse(rawPayload);
  const filesResult = publicUploadDescriptorsSchema.safeParse(rawFiles);

  if (
    !payloadResult.success ||
    !filesResult.success ||
    !isHumanSubmission(payloadResult.data.startedAt)
  ) {
    return { error: "invalid_request", status: "error" };
  }

  const existingReference = await findExistingSubmission(payloadResult.data.submissionId);

  if (existingReference) {
    return { reference: existingReference, status: "already_complete" };
  }

  const supabase = createAdminSupabaseClient();
  const uploads = await Promise.all(
    filesResult.data.map(async (file) => {
      const extension = FILE_EXTENSIONS[file.mimeType];
      const path = `guest/${payloadResult.data.submissionId}/${file.id}.${extension}`;
      const { data, error } = await supabase.storage
        .from(ATTACHMENTS_BUCKET)
        .createSignedUploadUrl(path, { upsert: true });

      if (error) {
        throw new Error("PUBLIC_REQUEST_SIGNED_UPLOAD_FAILED", { cause: error });
      }

      return {
        ...file,
        name: sanitizeFilename(file.name),
        path,
        token: data.token,
      };
    }),
  );

  return { status: "ready", uploads };
}

async function verifyUploadedFiles(
  payload: PublicRequestPayload,
  uploads: CompletedUpload[],
): Promise<boolean> {
  if (uploads.some((upload) => !isOwnedUploadPath(upload.path, payload.submissionId))) {
    return false;
  }

  const supabase = createAdminSupabaseClient();
  const results = await Promise.all(
    uploads.map(async (upload) => {
      const { data, error } = await supabase.storage.from(ATTACHMENTS_BUCKET).info(upload.path);

      return (
        !error &&
        data.size === upload.size &&
        data.contentType === upload.mimeType &&
        data.bucketId === ATTACHMENTS_BUCKET
      );
    }),
  );

  return results.every(Boolean);
}

function toDatabasePayload(payload: PublicRequestPayload): Json {
  return {
    cargo_description: payload.cargoDescription,
    contact: {
      email: payload.contact.email,
      full_name: payload.contact.fullName,
      mobile: payload.contact.mobile,
      notes: payload.contact.notes,
    },
    delivery: {
      city_id: payload.delivery.cityId,
      formatted_address: payload.delivery.formattedAddress,
      latitude: payload.delivery.latitude,
      longitude: payload.delivery.longitude,
    },
    locale: payload.locale,
    pickup: {
      city_id: payload.pickup.cityId,
      formatted_address: payload.pickup.formattedAddress,
      latitude: payload.pickup.latitude,
      longitude: payload.pickup.longitude,
    },
    privacy_consent_version: PUBLIC_REQUEST_CONSENT_VERSION,
    quantity: payload.quantity,
    selected_option_ids: payload.selectedOptionIds,
    service_id: payload.serviceId,
    submission_id: payload.submissionId,
  };
}

function toAttachmentPayload(uploads: CompletedUpload[]): Json {
  return uploads.map((upload) => ({
    checksum_sha256: upload.checksumSha256,
    mime_type: upload.mimeType,
    original_filename: sanitizeFilename(upload.name),
    size_bytes: upload.size,
    storage_path: upload.path,
  }));
}

export async function removePreparedUploads(submissionId: string, paths: string[]): Promise<void> {
  const safePaths = paths.filter((path) => isOwnedUploadPath(path, submissionId)).slice(0, 4);

  if (safePaths.length === 0) {
    return;
  }

  await createAdminSupabaseClient().storage.from(ATTACHMENTS_BUCKET).remove(safePaths);
}

export async function completePublicRequest(
  rawPayload: unknown,
  rawUploads: unknown,
): Promise<CompletePublicRequestResult> {
  const payloadResult = publicRequestPayloadSchema.safeParse(rawPayload);
  const uploadsResult = completedUploadsSchema.safeParse(rawUploads);

  if (!payloadResult.success || !uploadsResult.success) {
    return { error: "invalid_request", status: "error" };
  }

  if (!(await verifyUploadedFiles(payloadResult.data, uploadsResult.data))) {
    await removePreparedUploads(
      payloadResult.data.submissionId,
      uploadsResult.data.map((upload) => upload.path),
    );

    return { error: "upload_verification_failed", status: "error" };
  }

  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase.rpc("submit_guest_service_request", {
    attachment_payload: toAttachmentPayload(uploadsResult.data),
    request_payload: toDatabasePayload(payloadResult.data),
  });

  if (error || !data[0]?.reference_number) {
    await removePreparedUploads(
      payloadResult.data.submissionId,
      uploadsResult.data.map((upload) => upload.path),
    );

    throw new Error("PUBLIC_REQUEST_DATABASE_WRITE_FAILED", { cause: error });
  }

  try {
    const accountClient = await createServerSupabaseClient();
    const { data: claims } = await accountClient.auth.getClaims();
    if (claims?.claims?.sub) {
      await accountClient.rpc("resolve_identity_context");
      await accountClient.rpc("account_link_submission", {
        p_submission_key: payloadResult.data.submissionId,
      });
    }
  } catch {
    // Account convenience must never make the Guest-first submission fail.
  }

  return { reference: data[0].reference_number, status: "complete" };
}

export function createFileDescriptors(files: PublicUploadDescriptor[]): PublicUploadDescriptor[] {
  return publicUploadDescriptorsSchema.parse(files);
}
