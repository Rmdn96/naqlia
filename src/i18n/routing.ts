import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  defaultLocale: "ar",
  localePrefix: "always",
  locales: ["ar", "en"],
});

export type AppLocale = (typeof routing.locales)[number];
