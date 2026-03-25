import { NextResponse } from "next/server";

import { createClient } from "@/utils/supabase/server";
import { pinRateLimiter } from "@/utils/rate-limit";
import { removeUserPin } from "@/utils/upstash/redis-lock";

export async function POST() {
  const supabase = await createClient();
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { success: rateLimitOk } = await pinRateLimiter.limit(user.id);
    if (!rateLimitOk) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const userId = user.id;

    // Remove the PIN for the user
    await removeUserPin(userId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error removing PIN:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
