import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { moderateImage } from "@/utils/sightengine";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { imageUrl, context } = await request.json();

    if (!imageUrl) {
      return NextResponse.json(
        { error: "Image URL is required" },
        { status: 400 },
      );
    }

    const result = await moderateImage(imageUrl);

    // If flagged or blocked, log to moderation queue
    if (result.flagged || result.blocked) {
      await supabase.from("images_moderation").insert({
        image_url: imageUrl,
        uploaded_by: user.id,
        reported_by: null, // Auto-detected, not user-reported
        reason: result.reasons.join(", "),
        risk_level: result.riskLevel,
        sightengine_data: result.rawData,
        status: result.blocked ? "rejected" : "pending",
      });
    }

    return NextResponse.json({
      blocked: result.blocked,
      flagged: result.flagged,
      nsfw: result.nsfw,
      riskLevel: result.riskLevel,
      reasons: result.reasons,
    });
  } catch (error) {
    console.error("Error checking image:", error);
    return NextResponse.json(
      { error: "Failed to check image" },
      { status: 500 },
    );
  }
}
