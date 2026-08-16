import { type NextRequest, NextResponse } from "next/server";

import { resolveSignOutLocale } from "@/lib/auth/sign-out";
import {
  isApprovedServerAuthOrigin,
  resolveServerAuthRedirectOrigin,
} from "@/lib/auth/redirect-origin.server";
import { terminateRouteSupabaseSession } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const requestOrigin = request.headers.get("origin");
  if (!isApprovedServerAuthOrigin(requestOrigin)) {
    return new NextResponse(null, {
      headers: { "Cache-Control": "private, no-store, max-age=0" },
      status: 403,
    });
  }

  const formData = await request.formData();
  const locale = resolveSignOutLocale(formData.get("locale"));
  const publicOrigin = resolveServerAuthRedirectOrigin(requestOrigin);
  const response = NextResponse.redirect(new URL(`/${locale}`, publicOrigin), 303);
  response.headers.set("Cache-Control", "private, no-store, max-age=0");
  response.headers.set("Clear-Site-Data", '"cache"');
  response.headers.set("Referrer-Policy", "no-referrer");

  await terminateRouteSupabaseSession(request, response);
  return response;
}
