import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { createClient } from "@/utils/supabase/server";

export async function POST(request: Request) {
  const { searchParams } = new URL(request.url);
  const postId = searchParams.get("postId");

  if (!postId) {
    return NextResponse.json({ error: "Post ID is required" }, { status: 400 });
  }

  const supabase = await createClient();

  // Get the current user if logged in
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData?.user?.id;

  // Generate a session ID if user is not logged in
  const cookieStore = cookies();
  let sessionId = (await cookieStore).get("fragment_session_id")?.value;

  if (!sessionId) {
    sessionId = Math.random().toString(36).substring(2, 15);
    // Note: In Next.js App Router, we can't directly set cookies in API routes
    // This is just for generating a session ID for this request
  }

  try {
    // Check if this view already exists
    const viewQuery = userId
      ? supabase
          .from("fragment_views")
          .select("id")
          .eq("fragment_id", postId)
          .eq("user_id", userId)
      : supabase
          .from("fragment_views")
          .select("id")
          .eq("fragment_id", postId)
          .eq("session_id", sessionId);

    const { data: existingView } = await viewQuery;
    let isNewView = !existingView || existingView.length === 0;

    // If view doesn't exist, add it
    if (isNewView) {
      // Insert view record
      await supabase.from("fragment_views").insert({
        fragment_id: postId,
        user_id: userId || null,
        session_id: !userId ? sessionId : null,
      });
    }

    // Get current analytics or create new record
    const { data: analyticsData } = await supabase
      .from("fragment_analytics")
      .select("id, views, unique_views")
      .eq("fragment_id", postId)
      .single();

    if (analyticsData) {
      // Analytics record exists, update it
      await supabase
        .from("fragment_analytics")
        .update({
          views: analyticsData.views + 1,
          unique_views: isNewView
            ? analyticsData.unique_views + 1
            : analyticsData.unique_views,
          updated_at: new Date().toISOString(),
        })
        .eq("id", analyticsData.id);
    } else {
      // Analytics record doesn't exist, create it
      await supabase.from("fragment_analytics").insert({
        fragment_id: postId,
        views: 1,
        unique_views: isNewView ? 1 : 0,
      });
    }

    // Return a response that sets a cookie for the session
    const response = NextResponse.json({
      success: true,
      isNewView: isNewView,
    });

    // Set cookie for session tracking
    if (!sessionId) {
      response.cookies.set("fragment_session_id", sessionId, {
        maxAge: 60 * 60 * 24 * 365, // 1 year
        path: "/",
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
      });
    }

    return response;
  } catch (error) {
    console.error("Error recording view:", error);
    return NextResponse.json(
      { error: "Failed to record view" },
      { status: 500 },
    );
  }
}
