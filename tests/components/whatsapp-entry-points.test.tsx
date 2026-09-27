import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import type { ComponentProps } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import ar from "../../messages/ar.json";
import en from "../../messages/en.json";
import HomePage from "@/app/[locale]/page";
import { SeoCtas } from "@/features/seo/components/seo-page-sections";

vi.mock("@/i18n/navigation", () => ({
  Link: (props: ComponentProps<"a">) => <a {...props} />,
}));

vi.mock("next-intl/server", () => ({
  setRequestLocale: vi.fn(),
  getTranslations: vi.fn(),
}));
vi.mock("@/features/public-request/services/public-request.service", () => ({
  getPublicRequestCatalog: async () => ({ services: [], cities: [] }),
}));
vi.mock("@/features/public-home/services/public-home.service", () => ({
  getPublicHomeContent: async () => ({ reviews: [], cities: [] }),
}));
vi.mock("@/features/seo/services/seo.service", () => ({
  getIndexableCitySeoIndex: async () => [],
}));

describe("general WhatsApp entry points", () => {
  afterEach(() => cleanup());

  for (const [locale, messages] of [
    ["ar", ar],
    ["en", en],
  ] as const) {
    it(`${locale}: Hero and lower homepage CTAs open the shared two-contact chooser`, async () => {
      const { getTranslations } = await import("next-intl/server");
      vi.mocked(getTranslations).mockResolvedValue(
        ((key: keyof typeof messages.Home) => messages.Home[key]) as never,
      );
      render(
        <NextIntlClientProvider locale={locale} messages={messages}>
          {await HomePage({ params: Promise.resolve({ locale }) })}
        </NextIntlClientProvider>,
      );
      const triggers = screen.getAllByRole("button", { name: messages.Home.whatsappCta });
      expect(triggers).toHaveLength(2);
      expect(screen.queryByRole("link", { name: messages.Home.whatsappCta })).toBeNull();
      for (const trigger of triggers) {
        fireEvent.click(trigger);
        const dialog = screen.getByRole("dialog", { name: messages.Common.whatsappChooserTitle });
        expect(screen.getAllByRole("dialog")).toHaveLength(1);
        const links = within(dialog).getAllByRole("link");
        expect(links.map((link) => new URL(link.getAttribute("href")!).pathname)).toEqual([
          "/966547349947",
          "/966565845386",
        ]);
        for (const link of links) {
          expect(new URL(link.getAttribute("href")!).searchParams.get("text")).toBe(
            "مرحبًا، أتواصل معكم من موقع Naqlk وأرغب في الاستفسار عن خدمة نقل.",
          );
        }
        expect(dialog.firstElementChild?.getAttribute("dir")).toBe(locale === "ar" ? "rtl" : "ltr");
        fireEvent.keyDown(screen.getByRole("button", { name: messages.Common.whatsappClose }), {
          key: "Escape",
        });
        expect(screen.queryByRole("dialog")).toBeNull();
        expect(document.activeElement).toBe(trigger);
      }
    });

    it(`${locale}: city/service general contact opens the chooser without changing request prefill`, () => {
      render(
        <NextIntlClientProvider locale={locale} messages={messages}>
          <SeoCtas
            locale={locale}
            citySlug="jeddah"
            cityRole="destination"
            service="intercity_transport"
          />
        </NextIntlClientProvider>,
      );
      expect(
        screen
          .getByRole("link", { name: locale === "ar" ? "اطلب خدمة نقل" : "Request transport" })
          .getAttribute("href"),
      ).toContain("pickupCity=riyadh&deliveryCity=jeddah&service=intercity_transport");
      fireEvent.click(screen.getByRole("button", { name: messages.Common.whatsapp }));
      expect(
        screen.getByRole("dialog", { name: messages.Common.whatsappChooserTitle }),
      ).toBeTruthy();
      expect(screen.getAllByRole("dialog")).toHaveLength(1);
      expect(screen.getByText("0547349947")).toBeTruthy();
      expect(screen.getByText("0565845386")).toBeTruthy();
    });
  }
});
