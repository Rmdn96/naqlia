import { type NextRequest, NextResponse } from "next/server";

import { resolveSignOutLocale } from "@/lib/auth/sign-out";
import {
  getForwardedRequestOrigin,
  isApprovedServerAuthOrigin,
  resolveServerAuthRedirectOrigin,
} from "@/lib/auth/redirect-origin.server";
import { terminateRouteSupabaseSession } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

function getApprovedSignOutOrigin(request: NextRequest): string | null {
  const explicitOrigin = request.headers.get("origin");
  if (explicitOrigin) {
    return isApprovedServerAuthOrigin(explicitOrigin) ? explicitOrigin : null;
  }

  const forwardedOrigin = getForwardedRequestOrigin(request.headers);
  const sameOriginNavigation = request.headers.get("sec-fetch-site") === "same-origin";
  return sameOriginNavigation && isApprovedServerAuthOrigin(forwardedOrigin)
    ? forwardedOrigin
    : null;
}

export async function POST(request: NextRequest) {
  const requestOrigin = getApprovedSignOutOrigin(request);
  if (!requestOrigin) {
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
