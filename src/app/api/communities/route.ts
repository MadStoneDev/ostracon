import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import {
  isValidCommunityName,
  getCommunityNameError,
  isReservedCommunityName,
} from "@/utils/validation";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, displayName, description } = body;

    // Validate name
    const nameError = getCommunityNameError(name);
    if (nameError) {
      return NextResponse.json({ error: nameError }, { status: 400 });
    }

    if (isReservedCommunityName(name)) {
      return NextResponse.json(
        { error: "This community name is reserved" },
        { status: 400 },
      );
    }

    // Check if name already exists
    const { data: existing } = await supabase
      .from("communities")
      .select("id")
      .eq("name", name)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: "A community with this name already exists" },
        { status: 400 },
      );
    }

    // Create community
    const { data: community, error: createError } = await supabase
      .from("communities")
      .insert({
        name,
        display_name: displayName,
        description: description || null,
        created_by: user.id,
      })
      .select()
      .single();

    if (createError) {
      console.error("Create community error:", createError);
      return NextResponse.json(
        { error: "Failed to create community" },
        { status: 500 },
      );
    }

    // Add creator as admin
    const { error: memberError } = await supabase
      .from("community_members")
      .insert({
        community_id: community.id,
        user_id: user.id,
        role: "admin",
      });

    if (memberError) {
      console.error("Add member error:", memberError);
      // Community was created but membership failed
      // Don't fail the request, just log it
    }

    return NextResponse.json(community, { status: 201 });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
