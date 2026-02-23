import { NextResponse } from "next/server";

import { Redis } from "@upstash/redis";
import { createClient } from "@/utils/supabase/server";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export async function GET() {
  const supabase = await createClient();

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = user.id;

    // Check lock status directly from Redis
    const lockStatus = await redis.get<string>(`user:${userId}:lock`);

    // Check both "true" string and boolean true for flexibility
    const isLocked = lockStatus === "true";

    return NextResponse.json({
      isLocked,
      rawLockStatus: lockStatus,
    });
  } catch (error) {
    console.error("Error checking lock status:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
