"use server";

import { z } from "zod";

import {
  completePublicRequest,
  preparePublicRequest,
  removePreparedUploads,
} from "@/features/public-request/services/public-request.service";
import type {
  CompletePublicRequestResult,
  CompletedUpload,
  PreparePublicRequestResult,
  PublicRequestPayload,
  PublicUploadDescriptor,
} from "@/features/public-request/types/public-request";

export async function preparePublicRequestAction(
  payload: PublicRequestPayload,
  files: PublicUploadDescriptor[],
): Promise<PreparePublicRequestResult> {
  try {
    return await preparePublicRequest(payload, files);
  } catch {
    return { error: "service_unavailable", status: "error" };
  }
}

export async function completePublicRequestAction(
  payload: PublicRequestPayload,
  uploads: CompletedUpload[],
): Promise<CompletePublicRequestResult> {
  try {
    return await completePublicRequest(payload, uploads);
  } catch {
    return { error: "service_unavailable", status: "error" };
  }
}

export async function cancelPreparedUploadsAction(
  submissionId: string,
  paths: string[],
): Promise<void> {
  const submissionResult = z.string().uuid().safeParse(submissionId);
  const pathsResult = z.array(z.string().min(20).max(1024)).max(4).safeParse(paths);

  if (!submissionResult.success || !pathsResult.success) {
    return;
  }

  await removePreparedUploads(submissionResult.data, pathsResult.data);
}
