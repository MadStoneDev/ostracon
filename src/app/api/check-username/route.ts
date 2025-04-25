import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const username = url.searchParams.get("username");

  if (!username) {
    return NextResponse.json(
      { error: "Username parameter is required" },
      { status: 400 },
    );
  }

  // Basic validation
  if (username.length < 3 || username.length > 30) {
    return NextResponse.json(
      {
        available: false,
        error: "Username must be between 3 and 30 characters",
      },
      { status: 400 },
    );
  }

  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return NextResponse.json(
      {
        available: false,
        error: "Username can only contain letters, numbers, and underscores",
      },
      { status: 400 },
    );
  }

  try {
    const supabase = await createClient();

    // Check the users table
    const { data, error } = await supabase
      .from("users")
      .select("id")
      .eq("username", username)
      .maybeSingle();

    if (error) {
      console.error("Error checking username availability:", error);
      return NextResponse.json(
        { error: "Failed to check username availability" },
        { status: 500 },
      );
    }

    return NextResponse.json({ available: !data });
  } catch (error) {
    console.error("Unexpected error checking username:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 },
    );
  }
}
