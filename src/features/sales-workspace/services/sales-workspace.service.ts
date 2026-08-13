import "server-only";

import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { requireSalesWorkspacePermission } from "@/lib/auth/sales-workspace";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import {
  salesLeadIdSchema,
  salesQuotationIdSchema,
  toQuotationRpcPayload,
  quotationDraftSchema,
} from "@/features/sales-workspace/lib/validation";
import type {
  QuotationDraftPayload,
  SalesAttachment,
  SalesInboxPage,
  SalesLeadDetail,
  SalesWorkspaceFilterCatalog,
} from "@/features/sales-workspace/types/sales-workspace";
import type { AppLocale } from "@/i18n/routing";
import type { Json } from "@/types/supabase";

const ATTACHMENT_LINK_EXPIRY_SECONDS = 60 * 5;

export type SalesInboxQuery = {
  cityId?: string;
  page?: number;
  search?: string;
  serviceId?: string;
  sortBy?: "customer_name" | "reference_number" | "status" | "submitted_at";
  sortDirection?: "asc" | "desc";
  status?: string;
};

function isJsonObject(value: Json): value is Record<string, Json> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseRpcObject<T>(value: Json | null, errorCode: string): T {
  if (!isJsonObject(value)) {
    throw new Error(errorCode);
  }

  return value as T;
}

async function getSignedAttachments(attachments: SalesAttachment[]): Promise<SalesAttachment[]> {
  if (attachments.length === 0) {
    return attachments;
  }

  const supabase = createAdminSupabaseClient();

  return Promise.all(
    attachments.map(async (attachment) => {
      if (attachment.status !== "available") {
        return attachment;
      }

      const { data, error } = await supabase.storage
        .from(attachment.storage_bucket)
        .createSignedUrl(attachment.storage_path, ATTACHMENT_LINK_EXPIRY_SECONDS);

      return {
        ...attachment,
        signed_url: error ? null : data.signedUrl,
      };
    }),
  );
}

export async function getSalesWorkspaceFilterCatalog(
  locale: AppLocale,
): Promise<SalesWorkspaceFilterCatalog> {
  await requireSalesWorkspacePermission("sales.workspace.read");
  const supabase = await createServerSupabaseClient();
  const [citiesResult, servicesResult] = await Promise.all([
    supabase
      .from("cities")
      .select("id, name_ar, name_en")
      .eq("status", "active")
      .is("deleted_at", null)
      .order("display_order"),
    supabase
      .from("services")
      .select("id, name_ar, name_en")
      .eq("status", "active")
      .is("deleted_at", null)
      .order("display_order"),
  ]);

  if (citiesResult.error || servicesResult.error) {
    throw new Error("SALES_WORKSPACE_FILTER_CATALOG_UNAVAILABLE");
  }

  return {
    cities: citiesResult.data.map((city) => ({
      id: city.id,
      name: locale === "ar" ? city.name_ar : city.name_en,
    })),
    services: servicesResult.data.map((service) => ({
      id: service.id,
      name: locale === "ar" ? service.name_ar : service.name_en,
    })),
  };
}

export async function getSalesLeadInbox(query: SalesInboxQuery): Promise<SalesInboxPage> {
  await requireSalesWorkspacePermission("sales.workspace.read");
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.rpc("sales_list_lead_inbox", {
    p_city_id: query.cityId ?? null,
    p_page: query.page ?? 1,
    p_page_size: 20,
    p_search: query.search?.trim() || null,
    p_service_id: query.serviceId ?? null,
    p_sort_by: query.sortBy ?? "submitted_at",
    p_sort_direction: query.sortDirection ?? "desc",
    p_status: query.status ?? null,
  });

  if (error) {
    throw new Error("SALES_LEAD_INBOX_UNAVAILABLE", { cause: error });
  }

  return parseRpcObject<SalesInboxPage>(data, "SALES_LEAD_INBOX_INVALID_RESPONSE");
}

export async function getSalesLeadDetail(leadId: string): Promise<SalesLeadDetail> {
  const parsedLeadId = salesLeadIdSchema.parse(leadId);
  await requireSalesWorkspacePermission("sales.workspace.read");
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.rpc("sales_get_lead_detail", { p_lead_id: parsedLeadId });

  if (error) {
    throw new Error("SALES_LEAD_DETAIL_UNAVAILABLE", { cause: error });
  }

  const detail = parseRpcObject<SalesLeadDetail>(data, "SALES_LEAD_DETAIL_INVALID_RESPONSE");

  return {
    ...detail,
    attachments: await getSignedAttachments(detail.attachments),
  };
}

export async function markSalesLeadViewed(leadId: string): Promise<void> {
  const parsedLeadId = salesLeadIdSchema.parse(leadId);
  await requireSalesWorkspacePermission("sales.workspace.read");
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.rpc("sales_mark_lead_viewed", { p_lead_id: parsedLeadId });

  if (error) {
    throw new Error("SALES_LEAD_VIEW_RECORD_FAILED", { cause: error });
  }
}

export async function saveSalesQuotation(
  leadId: string,
  quotationId: string | null,
  rawDraft: QuotationDraftPayload,
): Promise<{ id: string }> {
  const parsedLeadId = salesLeadIdSchema.parse(leadId);
  const parsedQuotationId = quotationId ? salesQuotationIdSchema.parse(quotationId) : null;
  const draft = quotationDraftSchema.parse(rawDraft);
  await requireSalesWorkspacePermission("sales.workspace.manage");
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.rpc("sales_save_quotation", {
    p_draft_payload: toQuotationRpcPayload(draft),
    p_lead_id: parsedLeadId,
    p_quotation_id: parsedQuotationId,
  });

  if (error) {
    throw new Error("SALES_QUOTATION_SAVE_FAILED", { cause: error });
  }

  const result = parseRpcObject<{ id?: string }>(data, "SALES_QUOTATION_SAVE_INVALID_RESPONSE");

  if (!result.id) {
    throw new Error("SALES_QUOTATION_SAVE_INVALID_RESPONSE");
  }

  return { id: result.id };
}

function parseAccessToken(value: Json | null, errorCode: string): string {
  const result = parseRpcObject<{ customer_access_token?: string }>(value, errorCode);
  if (!result.customer_access_token || !/^[a-f0-9]{64}$/.test(result.customer_access_token)) {
    throw new Error(errorCode);
  }
  return result.customer_access_token;
}

export async function sendSalesQuotation(quotationId: string): Promise<string> {
  const parsedQuotationId = salesQuotationIdSchema.parse(quotationId);
  await requireSalesWorkspacePermission("sales.workspace.manage");
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.rpc("sales_send_quotation", {
    p_quotation_id: parsedQuotationId,
  });

  if (error) {
    throw new Error("SALES_QUOTATION_SEND_FAILED", { cause: error });
  }

  return parseAccessToken(data, "SALES_QUOTATION_SEND_INVALID_RESPONSE");
}

export async function reissueSalesQuotationAccess(quotationId: string): Promise<string> {
  const parsedQuotationId = salesQuotationIdSchema.parse(quotationId);
  await requireSalesWorkspacePermission("sales.workspace.manage");
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.rpc("sales_reissue_quotation_access", {
    p_quotation_id: parsedQuotationId,
  });

  if (error) {
    throw new Error("SALES_QUOTATION_ACCESS_REISSUE_FAILED", { cause: error });
  }

  return parseAccessToken(data, "SALES_QUOTATION_ACCESS_REISSUE_INVALID_RESPONSE");
}
