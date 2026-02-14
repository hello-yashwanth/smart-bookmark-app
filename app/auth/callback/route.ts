import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const forwardedHost = request.headers.get("x-forwarded-host");
      const isLocalEnv = process.env.NODE_ENV === "development";

      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${next}`);
      }
      if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`);
      }
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Implicit flow: tokens in URL hash (server never sees). Redirect to / with hash.
  const html = `<!DOCTYPE html><html><head><title>Redirecting...</title></head><body><p>Completing sign in...</p><script>window.location.replace('/'+(window.location.hash||''));</script></body></html>`;
  return new NextResponse(html, {
    headers: { "Content-Type": "text/html" },
  });
}
