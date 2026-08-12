export type LeadStatus = "cancelled" | "closed" | "converted" | "new" | "qualified" | "quoted";

export type QuotationStatus =
  "approved" | "cancelled" | "draft" | "expired" | "rejected" | "sent" | "superseded";

export type SalesInboxItem = {
  city_name_ar: string;
  city_name_en: string;
  customer_name: string;
  id: string;
  is_unread: boolean;
  mobile_number: string;
  reference_number: string;
  service_name_ar: string;
  service_name_en: string;
  status: LeadStatus;
  submitted_at: string;
  updated_at: string;
};

export type SalesInboxPage = {
  items: SalesInboxItem[];
  page: number;
  page_size: number;
  total: number;
};

export type SalesWorkspaceFilterCatalog = {
  cities: Array<{ id: string; name: string }>;
  services: Array<{ id: string; name: string }>;
};

export type SalesAddress = {
  city: { id: string; name_ar: string; name_en: string };
  district: string | null;
  formatted_address: string;
  latitude: number | null;
  longitude: number | null;
  route_access_notes: string | null;
};

export type SalesAttachment = {
  id: string;
  mime_type: string;
  original_filename: string;
  signed_url: string | null;
  size_bytes: number;
  status: "available" | "pending" | "quarantined" | "removed";
  storage_bucket: string;
  storage_path: string;
  uploaded_at: string;
};

export type QuotationLineItem = {
  description: string;
  id: string;
  line_number: number;
  line_total_amount: number;
  quantity: number;
  unit_price: number;
};

export type SalesQuotation = {
  approved_at: string | null;
  created_at: string;
  currency: string;
  customer_notes: string | null;
  expires_at: string;
  id: string;
  internal_notes: string | null;
  line_items: QuotationLineItem[];
  quotation_number: string;
  quoted_amount: number;
  rejected_at?: string | null;
  revision_number: number;
  sent_at: string | null;
  status: QuotationStatus;
  subtotal_amount: number;
  tax_amount: number;
  terms_ar: string;
  terms_en: string;
  updated_at: string;
  vat_rate: number;
};

export type SalesActivity = {
  actor: { display_name: string | null; id: string } | null;
  details: Record<string, unknown>;
  event_key: string;
  id: string;
  occurred_at: string;
};

export type SalesLead = {
  cargo_description: string | null;
  cargo_quantity: number | null;
  customer_name: string;
  customer_notes: string | null;
  email: string | null;
  id: string;
  internal_notes: string | null;
  mobile_number: string;
  preferred_locale: "ar" | "en";
  reference_number: string;
  service: { id: string; name_ar: string; name_en: string };
  service_options_snapshot: unknown[];
  status: LeadStatus;
  submitted_at: string;
};

export type SalesLeadDetail = {
  activity_log: SalesActivity[];
  attachments: SalesAttachment[];
  delivery_address: SalesAddress;
  lead: SalesLead;
  pickup_address: SalesAddress;
  quotations: SalesQuotation[];
};

export type QuotationDraftPayload = {
  currency: string;
  customerNotes: string;
  expiresAt: string;
  internalNotes: string;
  lineItems: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
  }>;
  vatRate: number;
};

export type QuotationCommandResult =
  | {
      customerPath?: string;
      quotationId: string;
      status: "success";
    }
  | {
      message:
        | "invalid_draft"
        | "not_authorized"
        | "not_found"
        | "reissue_failed"
        | "save_failed"
        | "send_failed";
      status: "error";
    };
