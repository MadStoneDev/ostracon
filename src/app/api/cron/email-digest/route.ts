import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { getResend } from "@/lib/resend";

/**
 * Cron endpoint for sending email digests.
 * Intended to be called by Vercel Cron or similar scheduler.
 * Set up with: vercel.json { "crons": [{ "path": "/api/cron/email-digest", "schedule": "0 9 * * *" }] }
 */
export async function GET(request: Request) {
  // Verify cron secret to prevent unauthorized calls
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = await createClient();
  const resend = getResend();

  try {
    // Get users who want daily digest and have unread notifications
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, username, settings")
      .not("settings", "is", null);

    if (!profiles) {
      return NextResponse.json({ sent: 0 });
    }

    let sentCount = 0;

    for (const profile of profiles) {
      const settings = profile.settings as any;
      const frequency = settings?.email_digest_frequency;

      if (!frequency || frequency === "never") continue;

      // For weekly, only send on Mondays
      if (frequency === "weekly" && new Date().getDay() !== 1) continue;

      // Get user's email from auth
      const { data: authUser } = await supabase.auth.admin.getUserById(profile.id);
      if (!authUser?.user?.email) continue;

      // Get unread notification count
      const { count } = await supabase
        .from("notifications")
        .select("id", { count: "exact", head: true })
        .eq("user_id", profile.id)
        .eq("read", false);

      if (!count || count === 0) continue;

      // Send digest email
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://ostracon.app";

      await resend.emails.send({
        from: "Ostracon <notifications@ostracon.app>",
        to: authUser.user.email,
        subject: `You have ${count} unread notification${count === 1 ? "" : "s"} on Ostracon`,
        html: `
          <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto;">
            <h2>Hey @${profile.username},</h2>
            <p>You have <strong>${count}</strong> unread notification${count === 1 ? "" : "s"} waiting for you on Ostracon.</p>
            <a href="${siteUrl}/notifications" style="display: inline-block; padding: 12px 24px; background: #6366f1; color: white; text-decoration: none; border-radius: 8px; font-weight: bold;">
              View Notifications
            </a>
            <p style="margin-top: 24px; font-size: 12px; color: #666;">
              You can change your email preferences in <a href="${siteUrl}/settings">Settings</a>.
            </p>
          </div>
        `,
      });

      sentCount++;
    }

    return NextResponse.json({ sent: sentCount });
  } catch (error) {
    console.error("Error sending email digests:", error);
    return NextResponse.json(
      { error: "Failed to send digests" },
      { status: 500 },
    );
  }
}
