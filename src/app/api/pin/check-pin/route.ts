import { NextResponse } from "next/server";

import { createClient } from "@/utils/supabase/server";
import { userHasPin } from "@/utils/upstash/redis-lock";

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

    const hasPin = await userHasPin(userId);

    return NextResponse.json({ hasPin });
  } catch (error) {
    console.error("Error checking PIN status:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
