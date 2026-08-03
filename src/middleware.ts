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

  return refreshSupabaseSession(request, response);
}

export const config = {
  matcher: ["/", "/(ar|en)/:path*"],
};
