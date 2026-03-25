import { NextResponse } from "next/server";

import { createClient } from "@/utils/supabase/server";
import { pinRateLimiter } from "@/utils/rate-limit";
import {
  verifyUserPin,
  unlockUserAccount,
  recordPinAttempt,
  resetPinAttempts,
  lockUserAccount,
  MAX_PIN_ATTEMPTS,
} from "@/utils/upstash/redis-lock";

export async function POST(request: Request) {
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
    const { pin } = await request.json();

    // Record attempt atomically — INCR returns the new count
    const attempts = await recordPinAttempt(userId);

    // Check limit BEFORE verifying PIN to prevent race condition
    if (attempts > MAX_PIN_ATTEMPTS) {
      await lockUserAccount(userId);
      return NextResponse.json(
        {
          error: "Too many failed attempts. Please try again later.",
          remainingAttempts: 0,
        },
        { status: 429 },
      );
    }

    // Verify the PIN
    const isPinValid = await verifyUserPin(userId, pin);

    if (isPinValid) {
      await unlockUserAccount(userId);
      await resetPinAttempts(userId);

      return NextResponse.json({
        success: true,
        redirectUrl: "/explore",
      });
    } else {
      const remainingAttempts = Math.max(0, MAX_PIN_ATTEMPTS - attempts);
      if (remainingAttempts <= 0) {
        await lockUserAccount(userId);
      }
      return NextResponse.json(
        {
          error: "Invalid PIN",
          remainingAttempts,
        },
        { status: 401 },
      );
    }
  } catch (error) {
    console.error("Error verifying PIN:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
