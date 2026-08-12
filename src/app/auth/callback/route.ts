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
  const tokenHash = request.nextUrl.searchParams.get("token_hash");
  const tokenType = request.nextUrl.searchParams.get("type");
  const nextPath = getSafeRedirectPath(request.nextUrl.searchParams.get("next"));

  if (request.nextUrl.searchParams.has("error")) {
    return createRedirect(request, nextPath, "error");
  }

  const supabase = await createServerSupabaseClient();
  const { error } = code
    ? await supabase.auth.exchangeCodeForSession(code)
    : tokenHash && tokenType === "magiclink"
      ? await supabase.auth.verifyOtp({ token_hash: tokenHash, type: tokenType })
      : { error: new Error("Missing or unsupported authentication credentials.") };

  if (error) {
    return createRedirect(request, nextPath, "error");
  }

  return createRedirect(request, nextPath);
}
