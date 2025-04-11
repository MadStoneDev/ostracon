import { NextResponse } from "next/server";

import { createClient } from "@/utils/supabase/server";
import { setUserPin } from "@/utils/upstash/redis-lock";

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

    // Validate PIN - must be 4 digits
    if (!pin || !/^\d{4}$/.test(pin)) {
      return NextResponse.json(
        { error: "PIN must be 4 digits" },
        { status: 400 },
      );
    }

    // Set the PIN for the user
    await setUserPin(userId, pin);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error setting PIN:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
