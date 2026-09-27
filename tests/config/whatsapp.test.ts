import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { afterEach, describe, expect, it, vi } from "vitest";

import { BRAND } from "@/config/brand";
import {
  getWhatsAppContactHref,
  getWhatsAppHref,
  WHATSAPP_CONTACT_MESSAGE,
  WHATSAPP_CONTACTS,
} from "@/config/site";

const officialNumber = "966547349947";

describe("official Naqlk WhatsApp configuration", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("uses the configured international number without formatting characters", () => {
    vi.stubEnv("NEXT_PUBLIC_WHATSAPP_NUMBER", officialNumber);

    const url = new URL(getWhatsAppHref("Hello Naqlk"));

    expect(url.origin + url.pathname).toBe(`https://wa.me/${officialNumber}`);
    expect(url.searchParams.get("text")).toBe("Hello Naqlk");
  });

  it("centralizes both public contact numbers and builds the approved message links", () => {
    expect(WHATSAPP_CONTACTS.map((contact) => contact.localNumber)).toEqual([
      "0547349947",
      "0565845386",
    ]);
    expect(WHATSAPP_CONTACTS.map((contact) => contact.internationalNumber)).toEqual([
      "966547349947",
      "966565845386",
    ]);

    const message = WHATSAPP_CONTACT_MESSAGE;
    expect(new URL(getWhatsAppContactHref(WHATSAPP_CONTACTS[0], message)).pathname).toBe(
      "/966547349947",
    );
    expect(
      new URL(getWhatsAppContactHref(WHATSAPP_CONTACTS[1], message)).searchParams.get("text"),
    ).toBe(message);
  });

  it("uses the centralized official fallback when deployment input is missing or invalid", () => {
    expect(BRAND.support.whatsapp).toBe(officialNumber);
    expect(new URL(getWhatsAppHref("نقلك")).pathname).toBe(`/${officialNumber}`);

    vi.stubEnv("NEXT_PUBLIC_WHATSAPP_NUMBER", "invalid");
    expect(new URL(getWhatsAppHref("Naqlk")).pathname).toBe(`/${officialNumber}`);
  });

  it("keeps contextual request/quotation/support links on the centralized helper", () => {
    const sources = [
      "src/app/[locale]/request/success/page.tsx",
      "src/features/customer-quotation/components/customer-quotation-view.tsx",
    ].map((file) => readFileSync(resolve(process.cwd(), file), "utf8"));

    for (const source of sources) {
      expect(source).toContain("getWhatsAppHref");
      expect(source).not.toMatch(/wa\.me\//);
      expect(source).not.toContain(officialNumber);
    }
  });

  it("uses the shared chooser for all general-contact pages", () => {
    for (const file of [
      "src/app/[locale]/page.tsx",
      "src/features/seo/components/seo-page-sections.tsx",
    ]) {
      const source = readFileSync(resolve(process.cwd(), file), "utf8");
      expect(source).toContain("<WhatsAppContactAction");
      expect(source).not.toContain("getWhatsAppHref");
      expect(source).not.toContain("wa.me/");
    }
  });

  it("keeps localized messages branded and excludes capabilities and internal identifiers", () => {
    const ar = JSON.parse(readFileSync(resolve(process.cwd(), "messages/ar.json"), "utf8"));
    const en = JSON.parse(readFileSync(resolve(process.cwd(), "messages/en.json"), "utf8"));
    const messages = [
      ar.Home.whatsappCta,
      en.Home.whatsappCta,
      ar.Home.whatsappMessage,
      en.Home.whatsappMessage,
      ar.Success.whatsappMessage,
      en.Success.whatsappMessage,
      ar.CustomerQuotation.whatsappMessage,
      en.CustomerQuotation.whatsappMessage,
    ];

    expect(ar.Home.whatsappCta).toContain("نقلك");
    expect(en.Home.whatsappCta).toContain("Naqlk");
    for (const message of messages) {
      expect(message).not.toMatch(/[a-f0-9]{64}/i);
      expect(message).not.toMatch(/[0-9a-f]{8}-[0-9a-f-]{27,}/i);
      expect(message.toLowerCase()).not.toContain("internal");
    }
  });
});
