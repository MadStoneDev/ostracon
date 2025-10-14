import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { updateSession } from "@/utils/supabase/middleware";

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Public Routes prefixes - these and all their subdirectories are public
  const publicRoutesPrefixes = [
    "/",
    "/auth", // Changed from /login to /auth to match your structure
    "/register",
    "/info",
    "/support",
    "/privacy-policy",
    "/terms-of-service",
    "/cookies-policy",
    "/error",
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
  const isPublicRoute = publicRoutesPrefixes.some((prefix) =>
    prefix === "/"
      ? path === "/"
      : path === prefix || path.startsWith(`${prefix}/`),
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

    // User is authenticated - check profile
    // Only perform this check on protected routes (not on /profile/setup)
    if (path !== "/profile/setup") {
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("id, username, account_status")
        .eq("id", user.id)
        .maybeSingle();

      // Profile doesn't exist (shouldn't happen with trigger, but safety check)
      if (error || !profile) {
        console.error("⚠️ Profile missing for user:", user.id, error);

        // Try to create profile as fallback
        const { error: createError } = await supabase
          .from("profiles")
          .insert({
            id: user.id,
            username: null,
          })
          .select()
          .single();

        if (createError) {
          console.error("❌ Failed to create profile:", createError);
        }

        // Redirect to profile setup
        return NextResponse.redirect(new URL("/profile/setup", request.url));
      }

      // Check account status
      if (profile.account_status === "suspended") {
        return NextResponse.redirect(
          new URL("/error?reason=suspended", request.url),
        );
      }

      if (profile.account_status === "banned") {
        // Log out banned users
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

      // Profile exists but no username - redirect to setup
      if (!profile.username) {
        return NextResponse.redirect(new URL("/profile/setup", request.url));
      }
    }

    // If on setup page but already has username, redirect to explore
    if (path === "/profile/setup") {
      const { data: profile } = await supabase
        .from("profiles")
        .select("username")
        .eq("id", user.id)
        .single();

      if (profile?.username) {
        return NextResponse.redirect(new URL("/explore", request.url));
      }
    }

    return await updateSession(request);
  } catch (error) {
    console.error("Middleware error:", error);
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
