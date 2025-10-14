import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ name: string }> },
) {
  try {
    const { name } = await params;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();
    const { newOwnerId } = body;

    if (!newOwnerId) {
      return NextResponse.json(
        { error: "New owner ID is required" },
        { status: 400 },
      );
    }

    // Fetch community
    const { data: community, error: fetchError } = await supabase
      .from("communities")
      .select("id, created_by")
      .eq("name", name)
      .single();

    if (fetchError || !community) {
      return NextResponse.json(
        { error: "Community not found" },
        { status: 404 },
      );
    }

    // Verify current user is the creator
    if (community.created_by !== user.id) {
      return NextResponse.json(
        { error: "Only the community creator can transfer ownership" },
        { status: 403 },
      );
    }

    // Verify new owner is an admin or moderator
    const { data: newOwnerMembership } = await supabase
      .from("community_members")
      .select("role")
      .eq("community_id", community.id)
      .eq("user_id", newOwnerId)
      .single();

    if (!newOwnerMembership) {
      return NextResponse.json(
        { error: "New owner must be a member of the community" },
        { status: 400 },
      );
    }

    if (
      newOwnerMembership.role !== "admin" &&
      newOwnerMembership.role !== "moderator"
    ) {
      return NextResponse.json(
        { error: "New owner must be an admin or moderator" },
        { status: 400 },
      );
    }

    // Transfer ownership
    const { error: updateCommunityError } = await supabase
      .from("communities")
      .update({ created_by: newOwnerId })
      .eq("id", community.id);

    if (updateCommunityError) {
      console.error("Update community creator error:", updateCommunityError);
      return NextResponse.json(
        { error: "Failed to transfer ownership" },
        { status: 500 },
      );
    }

    // Promote new owner to admin if they're not already
    if (newOwnerMembership.role !== "admin") {
      await supabase
        .from("community_members")
        .update({ role: "admin" })
        .eq("community_id", community.id)
        .eq("user_id", newOwnerId);
    }

    // Demote old owner to admin (from creator)
    await supabase
      .from("community_members")
      .update({ role: "admin" })
      .eq("community_id", community.id)
      .eq("user_id", user.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
