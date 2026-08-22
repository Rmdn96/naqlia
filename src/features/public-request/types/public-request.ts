import type { AppLocale } from "@/i18n/routing";

export type PublicCatalogCity = {
  id: string;
  name: string;
  region: string;
  slug: string;
};

export type PublicCatalogServiceOption = {
  id: string;
  name: string;
  serviceId: string | null;
};

export type PublicCatalogService = {
  description: string;
  id: string;
  key: string;
  name: string;
  scope: "both" | "intercity" | "local";
};

export type PublicRequestCatalog = {
  cities: PublicCatalogCity[];
  options: PublicCatalogServiceOption[];
  services: PublicCatalogService[];
};

export type RequestAddressDraft = {
  cityId: string;
  formattedAddress: string;
  latitude: number | null;
  longitude: number | null;
};

export type PublicRequestDraft = {
  consentAccepted: boolean;
  contact: {
    email: string;
    fullName: string;
    mobile: string;
    notes: string;
  };
  cargoDescription: string;
  delivery: RequestAddressDraft;
  honeypot: string;
  locale: AppLocale;
  pickup: RequestAddressDraft;
  quantity: string;
  selectedOptionIds: string[];
  serviceId: string;
  startedAt: number;
  submissionId: string;
};

export type PublicRequestPayload = {
  cargoDescription: string;
  consentAccepted: true;
  contact: {
    email: string | null;
    fullName: string;
    mobile: string;
    notes: string | null;
  };
  delivery: RequestAddressDraft;
  honeypot: "";
  locale: AppLocale;
  pickup: RequestAddressDraft;
  quantity: number | null;
  selectedOptionIds: string[];
  serviceId: string;
  startedAt: number;
  submissionId: string;
};

export type PublicRequestPayloadInput = Omit<
  PublicRequestPayload,
  "consentAccepted" | "honeypot"
> & {
  consentAccepted: boolean;
  honeypot: string;
};

export type PublicUploadDescriptor = {
  id: string;
  mimeType: string;
  name: string;
  size: number;
};

export type PreparedUpload = PublicUploadDescriptor & {
  path: string;
  token: string;
};

export type CompletedUpload = Omit<PreparedUpload, "token"> & {
  checksumSha256: string;
};

export type PreparePublicRequestResult =
  | { reference: string; status: "already_complete" }
  | { status: "ready"; uploads: PreparedUpload[] }
  | { error: "invalid_request" | "service_unavailable"; status: "error" };

export type CompletePublicRequestResult =
  | { reference: string; status: "complete" }
  | {
      error: "invalid_request" | "service_unavailable" | "upload_verification_failed";
      status: "error";
    };
