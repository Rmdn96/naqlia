import { normalizeSaudiMobile } from "@/features/public-request/lib/validation";
import type {
  PublicRequestCatalog,
  PublicRequestDraft,
  PublicRequestPayloadInput,
} from "@/features/public-request/types/public-request";

export type WizardErrorKey =
  | "addressLength"
  | "cargoDescription"
  | "consent"
  | "email"
  | "fullName"
  | "mobile"
  | "quantity"
  | "sameAddress"
  | "selectCity"
  | "selectService";

export type WizardErrors = Record<string, WizardErrorKey>;

export function createEmptyRequestDraft(locale: "ar" | "en"): PublicRequestDraft {
  const emptyAddress = {
    cityId: "",
    formattedAddress: "",
    latitude: null,
    longitude: null,
  };

  return {
    cargoDescription: "",
    consentAccepted: false,
    contact: { email: "", fullName: "", mobile: "", notes: "" },
    delivery: { ...emptyAddress },
    honeypot: "",
    locale,
    pickup: { ...emptyAddress },
    quantity: "",
    selectedOptionIds: [],
    serviceId: "",
    startedAt: Date.now(),
    submissionId: crypto.randomUUID(),
  };
}

export function validateWizardStep(
  step: number,
  draft: PublicRequestDraft,
  catalog: PublicRequestCatalog,
): WizardErrors {
  const errors: WizardErrors = {};

  if (step === 1) {
    const selectedService = catalog.services.find((service) => service.id === draft.serviceId);

    if (!selectedService) {
      errors.serviceId = "selectService";
    }

    return errors;
  }

  if (step === 2) {
    if (!catalog.cities.some((city) => city.id === draft.pickup.cityId)) {
      errors["pickup.cityId"] = "selectCity";
    }

    if (draft.pickup.formattedAddress.trim().length < 8) {
      errors["pickup.formattedAddress"] = "addressLength";
    }

    if (!catalog.cities.some((city) => city.id === draft.delivery.cityId)) {
      errors["delivery.cityId"] = "selectCity";
    }

    if (draft.delivery.formattedAddress.trim().length < 8) {
      errors["delivery.formattedAddress"] = "addressLength";
    }

    if (
      draft.pickup.cityId === draft.delivery.cityId &&
      draft.pickup.formattedAddress.trim().toLocaleLowerCase() ===
        draft.delivery.formattedAddress.trim().toLocaleLowerCase()
    ) {
      errors["delivery.formattedAddress"] = "sameAddress";
    }

    return errors;
  }

  if (step === 3) {
    if (draft.cargoDescription.trim().length < 5) {
      errors.cargoDescription = "cargoDescription";
    }

    if (draft.quantity && (!/^\d+$/.test(draft.quantity) || Number(draft.quantity) < 1)) {
      errors.quantity = "quantity";
    }

    return errors;
  }

  if (step === 4) {
    if (draft.contact.fullName.trim().length < 2) {
      errors.fullName = "fullName";
    }

    if (!/^\+9665\d{8}$/.test(normalizeSaudiMobile(draft.contact.mobile))) {
      errors.mobile = "mobile";
    }

    if (draft.contact.email.trim() && !/^\S+@\S+\.\S+$/.test(draft.contact.email.trim())) {
      errors.email = "email";
    }

    return errors;
  }

  if (step === 5 && !draft.consentAccepted) {
    errors.consentAccepted = "consent";
  }

  return errors;
}

export function toPublicRequestPayload(draft: PublicRequestDraft): PublicRequestPayloadInput {
  return {
    cargoDescription: draft.cargoDescription.trim(),
    consentAccepted: draft.consentAccepted,
    contact: {
      email: draft.contact.email.trim().toLowerCase() || null,
      fullName: draft.contact.fullName.trim(),
      mobile: normalizeSaudiMobile(draft.contact.mobile),
      notes: draft.contact.notes.trim() || null,
    },
    delivery: { ...draft.delivery, formattedAddress: draft.delivery.formattedAddress.trim() },
    honeypot: draft.honeypot,
    locale: draft.locale,
    pickup: { ...draft.pickup, formattedAddress: draft.pickup.formattedAddress.trim() },
    quantity: draft.quantity ? Number(draft.quantity) : null,
    selectedOptionIds: draft.selectedOptionIds,
    serviceId: draft.serviceId,
    startedAt: draft.startedAt,
    submissionId: draft.submissionId,
  };
}
