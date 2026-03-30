import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

/**
 * Handles magic link confirmation.
 * Receives token_hash and type from the rewritten magic link,
 * verifies with Supabase, and redirects to the app.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const origin = process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3080";
  const tokenHash = searchParams.get("token_hash");
  const type = (searchParams.get("type") || "magiclink") as
    | "magiclink"
    | "email";

  if (!tokenHash) {
    return NextResponse.redirect(`${origin}/auth?error=missing_token`);
  }

  const supabase = await createClient();

  const { data, error } = await supabase.auth.verifyOtp({
    token_hash: tokenHash,
    type,
  });

  if (error || !data.user) {
    console.error("Magic link verification failed:", error);
    return NextResponse.redirect(
      `${origin}/auth?error=invalid_or_expired_link`,
    );
  }

  // Check if user has completed profile setup
  const { data: profile } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", data.user.id)
    .single();

  if (!profile?.username) {
    return NextResponse.redirect(`${origin}/profile/setup`);
  }

  return NextResponse.redirect(`${origin}/explore`);
}
