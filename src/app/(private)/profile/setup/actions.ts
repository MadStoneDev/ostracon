"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";

export async function updateUsername(formData: { username: string }) {
  try {
    const supabase = await createClient();

    // Get the current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error("Error getting user:", userError);
      return {
        error: "You must be logged in to update your profile.",
        success: false,
      };
    }

    // Check if username is already taken
    const { data: existingUser, error: checkError } = await supabase
      .from("users")
      .select("id")
      .eq("username", formData.username)
      .maybeSingle();

    if (checkError) {
      console.error("Error checking username availability:", checkError);
      return {
        error: "Unable to verify username availability. Please try again.",
        success: false,
      };
    }

    if (existingUser) {
      return {
        error: "This username is already taken. Please choose another one.",
        success: false,
      };
    }

    // Update the username in the users table
    const { error: updateError } = await supabase
      .from("users")
      .update({ username: formData.username })
      .eq("id", user.id);

    if (updateError) {
      console.error("Error updating username:", updateError);
      return {
        error: "Failed to update username. Please try again.",
        success: false,
      };
    }

    // Redirect to explore page
    revalidatePath("/explore");
    redirect("/explore");

    // This return is for TypeScript, it will never be reached due to redirect
    return {
      success: true,
      error: null,
    };
  } catch (error) {
    if (error instanceof Error && !error.message.includes("NEXT_REDIRECT")) {
      console.error("Unexpected username update error:", error);
      return {
        error: "An unexpected error occurred. Please try again.",
        success: false,
      };
    }

    throw error;
  }
}
