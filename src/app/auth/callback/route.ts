import { type NextRequest, NextResponse } from "next/server";

import { getSafeRedirectPath } from "@/lib/auth/redirects";
import { createServerSupabaseClient } from "@/lib/supabase/server";

function createRedirect(request: NextRequest, path: string, result?: "error") {
  const redirectUrl = new URL(path, request.nextUrl.origin);

  if (result) {
    redirectUrl.searchParams.set("auth_result", result);
  }

  const response = NextResponse.redirect(redirectUrl);
  response.headers.set("Cache-Control", "private, no-store");

  return response;
}

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const nextPath = getSafeRedirectPath(request.nextUrl.searchParams.get("next"));

  if (!code || request.nextUrl.searchParams.has("error")) {
    return createRedirect(request, nextPath, "error");
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return createRedirect(request, nextPath, "error");
  }

  return createRedirect(request, nextPath);
}
