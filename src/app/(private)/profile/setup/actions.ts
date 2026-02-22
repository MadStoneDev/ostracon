"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import {
  isValidUsername,
  getUsernameError,
  isReservedUsername,
} from "@/utils/validation";

const MAX_BIO_LENGTH = 500;
const MIN_AGE = 16;

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

    // Validate username format
    const usernameError = getUsernameError(formData.username);
    if (usernameError) {
      return { error: usernameError, success: false };
    }

    if (!isValidUsername(formData.username)) {
      return { error: "Invalid username format", success: false };
    }

    // Check reserved names
    if (isReservedUsername(formData.username)) {
      return { error: "This username is reserved", success: false };
    }

    // Check username uniqueness
    const { data: existingUser } = await supabase
      .from("profiles")
      .select("id")
      .eq("username", formData.username)
      .neq("id", user.id)
      .single();

    if (existingUser) {
      return { error: "This username is already taken", success: false };
    }

    // Validate date of birth
    const birthDate = new Date(formData.dateOfBirth);
    if (isNaN(birthDate.getTime())) {
      return { error: "Invalid date of birth", success: false };
    }

    const ageDifMs = Date.now() - birthDate.getTime();
    const ageDate = new Date(ageDifMs);
    const age = Math.abs(ageDate.getUTCFullYear() - 1970);

    if (age < MIN_AGE) {
      return {
        error: `You must be at least ${MIN_AGE} years old to use this platform`,
        success: false,
      };
    }

    // Validate and sanitise bio
    let sanitisedBio: string | null = null;
    if (formData.bio) {
      if (formData.bio.length > MAX_BIO_LENGTH) {
        return {
          error: `Bio must be ${MAX_BIO_LENGTH} characters or less`,
          success: false,
        };
      }
      // Strip HTML tags from bio since it's plain text
      sanitisedBio = formData.bio.replace(/<[^>]*>/g, "").trim() || null;
    }

    // Update user record
    const { error } = await supabase.from("profiles").upsert({
      id: user.id,
      username: formData.username,
      date_of_birth: formData.dateOfBirth,
      bio: sanitisedBio,
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
    // Next.js redirect throws a special error — rethrow it
    if (error instanceof Error && error.message.includes("NEXT_REDIRECT")) {
      throw error;
    }
    console.error("Unexpected profile setup error:", error);
    return {
      error: "An unexpected error occurred",
      success: false,
    };
  }
}
