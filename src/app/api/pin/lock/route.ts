import { NextResponse } from "next/server";

import { createClient } from "@/utils/supabase/server";
import { lockUserAccount } from "@/utils/upstash/redis-lock";

export async function POST() {
  const supabase = await createClient();

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = user.id;

    // Lock the user account
    await lockUserAccount(userId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error locking account:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
