import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

/**
 * Subscribe a device for push notifications.
 * Stores the push subscription token for the authenticated user.
 */
export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { token, platform = "web" } = await request.json();

    if (!token) {
      return NextResponse.json(
        { error: "Push token is required" },
        { status: 400 },
      );
    }

    // Upsert the token (update last_used_at if exists)
    const { error } = await supabase.from("push_tokens").upsert(
      {
        user_id: user.id,
        token,
        platform,
        last_used_at: new Date().toISOString(),
      },
      { onConflict: "user_id,token" },
    );

    if (error) {
      console.error("Error saving push token:", error);
      return NextResponse.json(
        { error: "Failed to save push subscription" },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in push subscribe:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

/**
 * Unsubscribe from push notifications.
 */
export async function DELETE(request: Request) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { token } = await request.json();

    if (!token) {
      return NextResponse.json(
        { error: "Push token is required" },
        { status: 400 },
      );
    }

    await supabase
      .from("push_tokens")
      .delete()
      .eq("user_id", user.id)
      .eq("token", token);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in push unsubscribe:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
