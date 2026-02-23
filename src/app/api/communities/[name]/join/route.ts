import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ name: string }> },
) {
  const { name } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  // Fetch community
  const { data: community, error: communityError } = await supabase
    .from("communities")
    .select("id, join_type, member_count")
    .eq("name", name)
    .single();

  if (communityError || !community) {
    return NextResponse.json({ error: "Community not found" }, { status: 404 });
  }

  // Check not already a member
  const { data: existingMember } = await supabase
    .from("community_members")
    .select("id")
    .eq("community_id", community.id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (existingMember) {
    return NextResponse.json({ error: "Already a member" }, { status: 400 });
  }

  if (community.join_type === "private") {
    // Check no pending request
    const { data: existingRequest } = await supabase
      .from("community_join_requests")
      .select("id")
      .eq("community_id", community.id)
      .eq("user_id", user.id)
      .eq("status", "pending")
      .maybeSingle();

    if (existingRequest) {
      return NextResponse.json(
        { error: "You already have a pending request", status: "requested" },
        { status: 400 },
      );
    }

    // Insert join request
    const { error: requestError } = await supabase
      .from("community_join_requests")
      .insert({
        community_id: community.id,
        user_id: user.id,
        status: "pending",
      });

    if (requestError) {
      console.error("Error creating join request:", requestError);
      return NextResponse.json(
        { error: "Failed to submit join request" },
        { status: 500 },
      );
    }

    return NextResponse.json({ status: "requested" });
  }

  // Open community — add as member directly
  const { error: memberError } = await supabase
    .from("community_members")
    .insert({
      community_id: community.id,
      user_id: user.id,
      role: "member",
    });

  if (memberError) {
    console.error("Error joining community:", memberError);
    return NextResponse.json(
      { error: "Failed to join community" },
      { status: 500 },
    );
  }

  // Increment member count
  await supabase
    .from("communities")
    .update({ member_count: (community.member_count || 0) + 1 })
    .eq("id", community.id);

  return NextResponse.json({ status: "joined" });
}
