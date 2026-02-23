import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ name: string; userId: string }> },
) {
  const { name, userId } = await params;
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
    .select("id, member_count")
    .eq("name", name)
    .single();

  if (communityError || !community) {
    return NextResponse.json({ error: "Community not found" }, { status: 404 });
  }

  // Verify requester is admin or moderator
  const { data: membership } = await supabase
    .from("community_members")
    .select("role")
    .eq("community_id", community.id)
    .eq("user_id", user.id)
    .single();

  if (!membership || (membership.role !== "admin" && membership.role !== "moderator")) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  const body = await request.json();
  const { approve } = body;

  // Delete the join request
  const { error: deleteError } = await supabase
    .from("community_join_requests")
    .delete()
    .eq("community_id", community.id)
    .eq("user_id", userId)
    .eq("status", "pending");

  if (deleteError) {
    console.error("Error deleting join request:", deleteError);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 },
    );
  }

  if (approve) {
    // Add as member
    const { error: memberError } = await supabase
      .from("community_members")
      .insert({
        community_id: community.id,
        user_id: userId,
        role: "member",
      });

    if (memberError) {
      console.error("Error adding member:", memberError);
      return NextResponse.json(
        { error: "Failed to add member" },
        { status: 500 },
      );
    }

    // Increment member count
    await supabase
      .from("communities")
      .update({ member_count: (community.member_count || 0) + 1 })
      .eq("id", community.id);

    // Notify the user
    await supabase.from("notifications").insert({
      user_id: userId,
      actor_id: user.id,
      type: "community_join_approved",
    });

    return NextResponse.json({ status: "approved" });
  } else {
    // Notify the user of rejection
    await supabase.from("notifications").insert({
      user_id: userId,
      actor_id: user.id,
      type: "community_join_rejected",
    });

    return NextResponse.json({ status: "rejected" });
  }
}
