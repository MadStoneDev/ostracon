import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function PATCH(
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

    // Fetch community
    const { data: community, error: fetchError } = await supabase
      .from("communities")
      .select("id")
      .eq("name", name)
      .single();

    if (fetchError || !community) {
      return NextResponse.json(
        { error: "Community not found" },
        { status: 404 },
      );
    }

    // Check if user is admin/moderator
    const { data: membership } = await supabase
      .from("community_members")
      .select("role")
      .eq("community_id", community.id)
      .eq("user_id", user.id)
      .single();

    const canEdit =
      membership?.role === "admin" || membership?.role === "moderator";

    if (!canEdit) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Parse request body
    const body = await request.json();
    const { display_name, description, is_nsfw, rules } = body;

    // Build update object with only provided fields
    const updateData: any = {};
    if (display_name !== undefined) updateData.display_name = display_name;
    if (description !== undefined) updateData.description = description;
    if (is_nsfw !== undefined) updateData.is_nsfw = is_nsfw;
    if (rules !== undefined) updateData.rules = rules;

    // Update community
    const { data: updatedCommunity, error: updateError } = await supabase
      .from("communities")
      .update(updateData)
      .eq("id", community.id)
      .select()
      .single();

    if (updateError) {
      console.error("Update community error:", updateError);
      return NextResponse.json(
        { error: "Failed to update community" },
        { status: 500 },
      );
    }

    return NextResponse.json(updatedCommunity);
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

    // Fetch community
    const { data: community, error: fetchError } = await supabase
      .from("communities")
      .select("id")
      .eq("name", name)
      .single();

    if (fetchError || !community) {
      return NextResponse.json(
        { error: "Community not found" },
        { status: 404 },
      );
    }

    // Check if user is admin (only admins can delete)
    const { data: membership } = await supabase
      .from("community_members")
      .select("role")
      .eq("community_id", community.id)
      .eq("user_id", user.id)
      .single();

    if (membership?.role !== "admin") {
      return NextResponse.json(
        { error: "Only admins can delete communities" },
        { status: 403 },
      );
    }

    // Delete community (cascade will handle members, posts, etc.)
    const { error: deleteError } = await supabase
      .from("communities")
      .delete()
      .eq("id", community.id);

    if (deleteError) {
      console.error("Delete community error:", deleteError);
      return NextResponse.json(
        { error: "Failed to delete community" },
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
