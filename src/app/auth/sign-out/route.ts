import { type NextRequest, NextResponse } from "next/server";

import {
  resolveSignOutLocale,
  SIGN_OUT_INTENT_HEADER,
  SIGN_OUT_INTENT_VALUE,
} from "@/lib/auth/sign-out";
import {
  getForwardedRequestOrigin,
  isApprovedServerAuthOrigin,
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
  const sameOriginFetch =
    request.headers.get(SIGN_OUT_INTENT_HEADER) === SIGN_OUT_INTENT_VALUE &&
    request.headers.get("sec-fetch-site") !== "cross-site";
  return (sameOriginNavigation || sameOriginFetch) && isApprovedServerAuthOrigin(forwardedOrigin)
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
  const response = NextResponse.redirect(new URL(`/${locale}`, requestOrigin), 303);
  response.headers.set("Cache-Control", "private, no-store, max-age=0");
  response.headers.set("Clear-Site-Data", '"cache"');
  response.headers.set("Referrer-Policy", "no-referrer");

  await terminateRouteSupabaseSession(request, response);
  return response;
}
