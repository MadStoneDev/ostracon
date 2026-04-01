import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { updateSession } from "@/utils/supabase/middleware";
import { isUserLocked } from "@/utils/upstash/redis-lock";
import { calculateAge } from "@/utils/validation";

export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;

  const protectedRoutes = [
    "/connect",
    "/explore",
    "/messages",
    "/notifications",
    "/post",
    "/profile",
    "/search",
    "/settings",
  ];

  // Skip for static files and API routes
  if (
    path.startsWith("/_next") ||
    path.startsWith("/api") ||
    path.includes(".")
  ) {
    return NextResponse.next();
  }

  // Check if the path starts with any of the public route prefixes
  // Special handling for root path "/" to prevent it from matching everything
  const isPublicRoute = !protectedRoutes.some(
    (route) => path === route || path.startsWith(`${route}/`),
  );

  // Skip for public routes
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Check if user is authenticated
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Not authenticated - redirect to auth
    if (!user) {
      return NextResponse.redirect(new URL("/auth", request.url));
    }

    // Check MFA status — if user has 2FA enabled but session is aal1, redirect to verify
    if (path !== "/auth/mfa-verify" && path !== "/locked") {
      const { data: aalData } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      if (
        aalData &&
        aalData.nextLevel === "aal2" &&
        aalData.currentLevel === "aal1"
      ) {
        return NextResponse.redirect(new URL("/auth/mfa-verify", request.url));
      }
    }

    // Check if user is locked (PIN lock feature)
    // Do this early, before other checks, but allow /locked page
    if (path !== "/locked") {
      const locked = await isUserLocked(user.id);
      if (locked) {
        return NextResponse.redirect(new URL("/locked", request.url));
      }
    }

    // Only perform this check on protected routes
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("id, username, date_of_birth, account_status")
      .eq("id", user.id)
      .maybeSingle();

    // Allow profile setup page through — new users need to reach it
    if (path === "/profile/setup") {
      // If profile is fully set up, redirect to explore
      if (profile?.username && profile?.date_of_birth) {
        return NextResponse.redirect(new URL("/explore", request.url));
      }
      // Otherwise let them through to complete setup (even if no profile row exists)
      return await updateSession(request);
    }

    // Profile doesn't exist — redirect to setup
    // This must come AFTER the /profile/setup check to avoid a redirect loop
    if (error || !profile) {
      return NextResponse.redirect(new URL("/profile/setup", request.url));
    }

    // For all other protected routes, require completed profile
    if (!profile.username || !profile.date_of_birth) {
      return NextResponse.redirect(new URL("/profile/setup", request.url));
    }

    // Age check
    const birthDate = new Date(profile.date_of_birth);
    const age = calculateAge(birthDate);

    if (age < 21) {
      return NextResponse.redirect(new URL("/age-restricted", request.url));
    }

    // Check account status
    if (profile.account_status === "suspended") {
      return NextResponse.redirect(
        new URL("/error?reason=suspended", request.url),
      );
    }

    if (profile.account_status === "banned") {
      await supabase.auth.signOut();
      return NextResponse.redirect(
        new URL("/error?reason=banned", request.url),
      );
    }

    if (profile.account_status === "deactivated") {
      return NextResponse.redirect(
        new URL("/error?reason=deactivated", request.url),
      );
    }

    return await updateSession(request);
  } catch (error) {
    console.error("Proxy error:", error);
    return NextResponse.redirect(new URL("/error", request.url));
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
