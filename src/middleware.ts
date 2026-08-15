import type { NextRequest } from "next/server";
import createMiddleware from "next-intl/middleware";

import { routing } from "@/i18n/routing";
import { refreshSupabaseSession } from "@/lib/supabase/middleware";

const handleInternationalization = createMiddleware(routing);

export async function middleware(request: NextRequest) {
  const response = handleInternationalization(request);

  if (response.status >= 300 && response.status < 400) {
    return response;
  }

  const refreshed = await refreshSupabaseSession(request, response);
  const privatePath =
    /^\/(ar|en)\/(?:track|quote|account|login|staff|dashboard|sales|operations|quality|finance|settings|admin)(?:\/|$)/.test(
      request.nextUrl.pathname,
    );

  if (privatePath) {
    refreshed.headers.set("Cache-Control", "private, no-store, max-age=0");
    refreshed.headers.set("Referrer-Policy", "no-referrer");
    refreshed.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
  }
  return refreshed;
}

export const config = {
  matcher: ["/", "/(ar|en)/:path*"],
};
