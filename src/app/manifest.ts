import type { MetadataRoute } from "next";

import { BRAND } from "@/config/brand";

export default function manifest(): MetadataRoute.Manifest {
  return {
    background_color: "#ffffff",
    description: BRAND.metadata.defaultDescription.ar,
    dir: "rtl",
    display: "standalone",
    icons: [
      { sizes: "any", src: "/icon.svg", type: "image/svg+xml" },
      { sizes: "192x192", src: "/brand/naqlk-app-icon-192.png", type: "image/png" },
      { sizes: "512x512", src: "/brand/naqlk-app-icon-512.png", type: "image/png" },
    ],
    lang: "ar",
    name: `${BRAND.names.ar} — ${BRAND.names.en}`,
    short_name: BRAND.names.ar,
    start_url: "/ar",
    theme_color: "#0b2b5b",
  };
}
