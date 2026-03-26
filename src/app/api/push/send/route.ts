import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import webpush from "web-push";

/**
 * Internal endpoint to send push notifications to a user's devices.
 * Should be called from server actions/webhooks, not directly by clients.
 */
export async function POST(request: Request) {
  // Only allow internal calls via cron secret or service role
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { userId, title, body, url, tag } = await request.json();

    if (!userId || !title) {
      return NextResponse.json(
        { error: "userId and title are required" },
        { status: 400 },
      );
    }

    const supabase = await createClient();

    // Get user's push tokens
    const { data: tokens } = await supabase
      .from("push_tokens")
      .select("token, platform")
      .eq("user_id", userId);

    if (!tokens || tokens.length === 0) {
      return NextResponse.json({ sent: 0, reason: "No push tokens" });
    }

    const vapidPublic = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    const vapidPrivate = process.env.VAPID_PRIVATE_KEY;

    if (!vapidPublic || !vapidPrivate) {
      return NextResponse.json(
        { error: "VAPID keys not configured" },
        { status: 500 },
      );
    }

    webpush.setVapidDetails(
      `mailto:${process.env.VAPID_EMAIL || "support@ostracon.app"}`,
      vapidPublic,
      vapidPrivate,
    );

    const payload = JSON.stringify({ title, body, url, tag });
    let sentCount = 0;
    const failedTokens: string[] = [];

    for (const { token, platform } of tokens) {
      if (platform !== "web") continue; // Only web push for now

      try {
        const subscription = JSON.parse(token);
        await webpush.sendNotification(subscription, payload);
        sentCount++;
      } catch (error: any) {
        // Remove expired/invalid tokens
        if (error.statusCode === 404 || error.statusCode === 410) {
          failedTokens.push(token);
        }
        console.error("Push send error:", error.statusCode || error.message);
      }
    }

    // Clean up invalid tokens
    if (failedTokens.length > 0) {
      await supabase
        .from("push_tokens")
        .delete()
        .eq("user_id", userId)
        .in("token", failedTokens);
    }

    return NextResponse.json({ sent: sentCount });
  } catch (error) {
    console.error("Error sending push:", error);
    return NextResponse.json(
      { error: "Failed to send push" },
      { status: 500 },
    );
  }
}
