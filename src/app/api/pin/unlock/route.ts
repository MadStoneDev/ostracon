import { NextResponse } from "next/server";

import { createClient } from "@/utils/supabase/server";
import {
  verifyUserPin,
  unlockUserAccount,
  recordPinAttempt,
  getRemainingAttempts,
  resetPinAttempts,
  lockUserAccount,
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

    const userId = user.id;
    const { pin } = await request.json();

    // Record attempt and get number of attempts
    const attempts = await recordPinAttempt(userId);
    const remainingAttempts = await getRemainingAttempts(userId);

    // If out of attempts, keep the account locked
    if (remainingAttempts <= 0) {
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
      // Unlock the account and reset attempts on success
      await unlockUserAccount(userId);
      await resetPinAttempts(userId);

      return NextResponse.json({
        success: true,
        redirectUrl: "/explore",
      });
    } else {
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
