import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig = {
  async headers() {
    return [
      {
        headers: [
          { key: "Cache-Control", value: "private, no-store, max-age=0" },
          { key: "Referrer-Policy", value: "no-referrer" },
          { key: "X-Robots-Tag", value: "noindex, nofollow, noarchive, nosnippet" },
        ],
        source: "/:locale(ar|en)/quote/:path*",
      },
      {
        headers: [
          { key: "Cache-Control", value: "private, no-store, max-age=0" },
          { key: "Referrer-Policy", value: "no-referrer" },
          { key: "X-Robots-Tag", value: "noindex, nofollow, noarchive, nosnippet" },
        ],
        source: "/:locale(ar|en)/track/:path*",
      },
    ];
  },
  poweredByHeader: false,
  reactStrictMode: true,
  typedRoutes: true,
} satisfies NextConfig;

export default withNextIntl(nextConfig);
