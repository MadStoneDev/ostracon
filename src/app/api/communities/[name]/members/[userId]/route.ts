import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ name: string; userId: string }> },
) {
  try {
    const { name, userId } = await params;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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

    // Check if requester is admin/creator
    const { data: requesterMembership } = await supabase
      .from("community_members")
      .select("role")
      .eq("community_id", community.id)
      .eq("user_id", user.id)
      .single();

    const isCreator = user.id === community.created_by;
    const isAdmin = requesterMembership?.role === "admin";

    if (!isCreator && !isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get target user's current role
    const { data: targetMembership } = await supabase
      .from("community_members")
      .select("role")
      .eq("community_id", community.id)
      .eq("user_id", userId)
      .single();

    if (!targetMembership) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    // Parse request body
    const body = await request.json();
    const { role } = body;

    // Validation: Only creator can make admins
    if (role === "admin" && !isCreator) {
      return NextResponse.json(
        { error: "Only the community creator can assign admin role" },
        { status: 403 },
      );
    }

    // Validation: Can't modify creator
    if (userId === community.created_by) {
      return NextResponse.json(
        { error: "Cannot modify community creator" },
        { status: 403 },
      );
    }

    // Validation: Admins can't modify other admins
    if (targetMembership.role === "admin" && !isCreator) {
      return NextResponse.json(
        { error: "Only the creator can modify admins" },
        { status: 403 },
      );
    }

    // Update role
    const { error: updateError } = await supabase
      .from("community_members")
      .update({ role })
      .eq("community_id", community.id)
      .eq("user_id", userId);

    if (updateError) {
      console.error("Update member role error:", updateError);
      return NextResponse.json(
        { error: "Failed to update member role" },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ name: string; userId: string }> },
) {
  try {
    const { name, userId } = await params;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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

    // Check if requester is admin/moderator
    const { data: requesterMembership } = await supabase
      .from("community_members")
      .select("role")
      .eq("community_id", community.id)
      .eq("user_id", user.id)
      .single();

    const canRemove =
      requesterMembership?.role === "admin" ||
      requesterMembership?.role === "moderator";

    if (!canRemove) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Can't remove creator
    if (userId === community.created_by) {
      return NextResponse.json(
        { error: "Cannot remove community creator" },
        { status: 403 },
      );
    }

    // Get target user's role
    const { data: targetMembership } = await supabase
      .from("community_members")
      .select("role")
      .eq("community_id", community.id)
      .eq("user_id", userId)
      .single();

    // Moderators can't remove admins
    if (
      requesterMembership?.role === "moderator" &&
      targetMembership?.role === "admin"
    ) {
      return NextResponse.json(
        { error: "Moderators cannot remove admins" },
        { status: 403 },
      );
    }

    // Remove member
    const { error: deleteError } = await supabase
      .from("community_members")
      .delete()
      .eq("community_id", community.id)
      .eq("user_id", userId);

    if (deleteError) {
      console.error("Remove member error:", deleteError);
      return NextResponse.json(
        { error: "Failed to remove member" },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
