"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

export async function updateProfileSetup(formData: {
  username: string;
  dateOfBirth: string;
  bio?: string;
}) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        error: "Not authenticated",
        success: false,
      };
    }

    // Validate date of birth
    const birthDate = new Date(formData.dateOfBirth);
    const ageDifMs = Date.now() - birthDate.getTime();
    const ageDate = new Date(ageDifMs);
    const age = Math.abs(ageDate.getUTCFullYear() - 1970);

    // Update user record
    const { error } = await supabase.from("profiles").upsert({
      id: user.id,
      username: formData.username,
      date_of_birth: formData.dateOfBirth,
      bio: formData.bio || null,
    });

    if (error) {
      console.error("Profile update error:", error);
      return {
        error: "Failed to update profile",
        success: false,
      };
    }

    redirect("/explore");
  } catch (error) {
    console.error("Unexpected profile setup error:", error);
    return {
      error: "An unexpected error occurred",
      success: false,
    };
  }
}
