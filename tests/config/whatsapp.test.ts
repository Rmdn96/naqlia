import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

import {
  CONTACT_NUMBERS,
  getContactTelephoneHref,
  getContactWhatsAppHref,
  normalizeSaudiPhone,
} from "@/config/contact";

describe("centralized Naqlk contact numbers", () => {
  it("keeps the configured contacts data-driven", () => {
    expect(CONTACT_NUMBERS).toEqual([
      { id: "contact-1", phone: "0547349947" },
      { id: "contact-2", phone: "0565845386" },
    ]);
  });

  it.each([
    ["0547349947", "966547349947"],
    ["0565845386", "966565845386"],
    ["+966 54 734 9947", "966547349947"],
  ])("normalizes %s to %s", (phone, normalized) => {
    expect(normalizeSaudiPhone(phone)).toBe(normalized);
  });

  it("builds encoded WhatsApp and telephone links", () => {
    const whatsapp = new URL(getContactWhatsAppHref("0547349947", "Hello Naqlk & welcome")!);
    expect(whatsapp.origin + whatsapp.pathname).toBe("https://wa.me/966547349947");
    expect(whatsapp.searchParams.get("text")).toBe("Hello Naqlk & welcome");
    expect(getContactTelephoneHref("0565845386")).toBe("tel:+966565845386");
  });

  it("returns no broken link for an empty phone value", () => {
    expect(getContactWhatsAppHref("", "Hello")).toBeNull();
    expect(getContactTelephoneHref("")).toBeNull();
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
